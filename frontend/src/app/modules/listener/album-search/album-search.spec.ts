import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlbumSearch } from './album-search';

describe('AlbumSearch', () => {
  let component: AlbumSearch;
  let fixture: ComponentFixture<AlbumSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlbumSearch],
    }).compileComponents();

    fixture = TestBed.createComponent(AlbumSearch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
