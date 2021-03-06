import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { MessagingModule, MessagingService } from '@testeditor/messaging-service';
import { HttpProviderService } from '../http-provider-service/http-provider.service';
import { Conflict } from './conflict';
import { PullActionProtocol } from './pull-action-protocol.service';

export const HTTP_STATUS_CONFLICT = 409;


/** generates an action that provides (potentially different) behaviour for each call

    invocation count is the index into the passed array of answers, index going out of bounds restarts at the beginning
    e.g. getActionsFor('a', true, new HttpErrorResonse(..))
    will return the string 'a' on first invocation, boolean true on second and throws a HttpErrorResponse on third invocation */
let actionCalledCount = 0;
function  getActionsFor(...answers: any[]): (client: HttpClient) => Promise<Boolean> {
  actionCalledCount = 0;
  return (_) => {
    const idx = actionCalledCount % answers.length;
    actionCalledCount++;
    if (answers[idx] instanceof HttpErrorResponse) {
      throw answers[idx];
    } else {
      return Promise.resolve(answers[idx]);
    }
  };
}

describe('PullActionProtocol', () => {
  let messagingService: MessagingService;
  let httpClient: HttpClient;
  let httpProviderService: HttpProviderService;
  let pullMatcher: any;
  let repullResponseError: HttpErrorResponse;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        HttpClientTestingModule,
        MessagingModule.forRoot()
      ],
      providers: [
        HttpClient,
        HttpProviderService
      ]
    });

    messagingService = TestBed.get(MessagingService);
    httpClient = TestBed.get(HttpClient);
    httpProviderService = TestBed.get(HttpProviderService);

    messagingService.subscribe('httpClient.needed', () => {
      messagingService.publish('httpClient.supplied', { httpClient: httpClient });
    });

    repullResponseError = new HttpErrorResponse({ error: 'REPULL', status: HTTP_STATUS_CONFLICT });

    pullMatcher = {
      method: 'POST',
      url: 'http://service-url/workspace/pull'
    };
  });

  it('is initially executable and result is undefined',  () => {
    // given
    // when
    const pullActionProtocol = new PullActionProtocol(httpProviderService, 'http://service-url',
                                                      async (client: HttpClient) => true, [], [], []);
    // then
    expect(pullActionProtocol.executionPossible()).toBeTruthy();
    expect(pullActionProtocol.result).toBeUndefined();
  });

  it('executes (pull and action)', fakeAsync(inject([HttpTestingController],
    (httpMock: HttpTestingController) => {
      // given
      const pullActionProtocol = new PullActionProtocol(httpProviderService, 'http://service-url',
                                                        async (client: HttpClient) => true, [], [], []);
      // when
      pullActionProtocol.execute();
      tick();

      // then
      httpMock.match(pullMatcher)[0].flush({
        failure: false, diffExists: false, headCommit: 'abcdef',
        changedResources: [],
        backedUpResources: []
      });
      tick();

      expect(pullActionProtocol.result).toBeTruthy();
      expect(pullActionProtocol.executionPossible()).toBeFalsy();
    })));

  it('executing pull and action reports error if diff happens in cirtical file list',
    fakeAsync(inject([HttpTestingController], (httpMock: HttpTestingController) => {
      // given
      const pullActionProtocol = new PullActionProtocol(httpProviderService, 'http://service-url',
                                                        async (client: HttpClient) => true, [], [], ['critical-file']);
      // when
      pullActionProtocol.execute();
      tick();

      // then
      httpMock.expectOne(pullMatcher).flush({
        failure: false, diffExists: false, headCommit: 'abcdef',
        changedResources: ['critical-file'],
        backedUpResources: []
      });
      tick();

      expect(pullActionProtocol.result instanceof Conflict).toBeTruthy();
      expect((pullActionProtocol.result as Conflict).message).toMatch(new RegExp('.*touching.*action.*'));
      expect(pullActionProtocol.executionPossible()).toBeFalsy();
    })));

  it('executes (pull and action) three times, succeeds on third call, and aggregates diffs in non-critical files (removing duplicates)',
    fakeAsync(inject([HttpTestingController], (httpMock: HttpTestingController) => {
      // given
      const pullActionProtocol = new PullActionProtocol(
        httpProviderService, 'http://service-url', getActionsFor(repullResponseError, repullResponseError, true),
        ['non-dirty-file', 'second-non-dirty-file'],
        ['dirty-file', 'second-dirty-file'], []);

      // when
      pullActionProtocol.execute();
      tick();

      httpMock.match(pullMatcher)[0].flush({
        failure: false, diffExists: true, headCommit: 'abcdef',
        changedResources: ['non-dirty-file'],
        backedUpResources: [{resource: 'dirty-file', backupResource: 'backup-file'}]
      });
      tick();

      for (let i = 0; i < 2; i++) {
        expect(pullActionProtocol.result).toBeUndefined();
        expect(pullActionProtocol.executionPossible()).toBeTruthy();
        pullActionProtocol.execute();
        tick();

        httpMock.match(pullMatcher)[0].flush({
          failure: false, diffExists: true, headCommit: 'bcdef',
          changedResources: ['second-non-dirty-file'],
          backedUpResources: [{resource: 'second-dirty-file', backupResource: 'second-backup-file'}]
        });
        tick();
      }

      // then
      expect(pullActionProtocol.result).toBeTruthy();
      expect(Array.from(pullActionProtocol.changedResourcesSet)).toEqual(['non-dirty-file', 'second-non-dirty-file']);
      expect(pullActionProtocol.backedUpResourcesSet.toArray()).toEqual(
        jasmine.objectContaining([{ resource: 'dirty-file', backupResource: 'backup-file' },
                                  { resource: 'second-dirty-file', backupResource: 'second-backup-file' }]));
      expect(pullActionProtocol.executionPossible()).toBeFalsy();
    })));

  it('executing fails if pull fails',
    fakeAsync(inject([HttpTestingController], (httpMock: HttpTestingController) => {
      // given
      const pullActionProtocol = new PullActionProtocol(
        httpProviderService, 'http://service-url', getActionsFor(true),
        [], [], []);

      // when
      pullActionProtocol.execute();
      tick();

      httpMock.match(pullMatcher)[0].flush({
        failure: true, diffExists: false, headCommit: 'abcdef',
        changedResources: [],
        backedUpResources: []
      });
      tick();

      // then
      expect(pullActionProtocol.executionPossible()).toBeFalsy();
      expect(pullActionProtocol.result instanceof Error).toBeTruthy();
      expect((pullActionProtocol.result as Error).message).toMatch(new RegExp('.*pull.*failure.*'));
    })));

  it('execution fails after two consecutive pulls without diff, given that the backend keeps requesting repulls',
    fakeAsync(inject([HttpTestingController], (httpMock: HttpTestingController) => {
      // given
      const pullActionProtocol = new PullActionProtocol(
        httpProviderService, 'http://service-url', getActionsFor(repullResponseError),
        [], [], []);
      const diffOn = [ false, true, false, true, false, false ];

      // when
      for (let i = 0; i < 6; i++) {
        expect(pullActionProtocol.executionPossible()).toBeTruthy('failed on count ' + i);

        pullActionProtocol.execute();
        tick();

        httpMock.match(pullMatcher)[0].flush({
          failure: false, diffExists: diffOn[i], headCommit: 'abcdef',
          changedResources: [],
          backedUpResources: []
        });
        tick();
      }

      expect(pullActionProtocol.executionPossible()).toBeFalsy();
      expect(pullActionProtocol.result instanceof Error).toBeTruthy();
      expect((pullActionProtocol.result as Error).message).toMatch(new RegExp('.*consecutive.*retr.*'));
    })));

});
