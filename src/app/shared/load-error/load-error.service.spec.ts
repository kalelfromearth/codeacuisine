import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { LoadErrorService, loadErrorRouterFeature } from './load-error.service';

@Component({ template: '' })
class WorkingPage {}

function failToLoadPage(): Promise<never> {
  return Promise.reject(new Error('The file of the page is gone.'));
}

function openWorkingPage(): Promise<typeof WorkingPage> {
  return Promise.resolve(WorkingPage);
}

async function tryToOpen(router: Router, url: string): Promise<void> {
  try {
    await router.navigateByUrl(url);
  } catch {
    // The router may pass the error on, the message is what this test looks at.
  }
}

describe('LoadErrorService', function () {
  function setUp(): { service: LoadErrorService; router: Router } {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            { path: 'broken', loadComponent: failToLoadPage },
            { path: 'working', loadComponent: openWorkingPage },
          ],
          loadErrorRouterFeature,
        ),
      ],
    });
    return { service: TestBed.inject(LoadErrorService), router: TestBed.inject(Router) };
  }

  it('starts without an error', function () {
    expect(setUp().service.hasLoadError()).toBe(false);
  });

  it('reports an error and clears it again', function () {
    const { service } = setUp();
    service.report();
    expect(service.hasLoadError()).toBe(true);
    service.clear();
    expect(service.hasLoadError()).toBe(false);
  });

  it('reports an error when the file of a page cannot be loaded', async function () {
    const { service, router } = setUp();
    await tryToOpen(router, '/broken');
    expect(service.hasLoadError()).toBe(true);
  });

  it('hides the error when the visitor opens a page that works', async function () {
    const { service, router } = setUp();
    await tryToOpen(router, '/broken');
    await tryToOpen(router, '/working');
    expect(service.hasLoadError()).toBe(false);
  });
});
