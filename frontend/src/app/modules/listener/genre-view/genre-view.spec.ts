import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenreView } from './genre-view';

describe('GenreView', () => {
  let component: GenreView;
  let fixture: ComponentFixture<GenreView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenreView],
    }).compileComponents();

    fixture = TestBed.createComponent(GenreView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
