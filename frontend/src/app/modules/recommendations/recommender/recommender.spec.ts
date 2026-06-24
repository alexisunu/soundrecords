import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Recommender } from './recommender';

describe('Recommender', () => {
  let component: Recommender;
  let fixture: ComponentFixture<Recommender>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Recommender],
    }).compileComponents();

    fixture = TestBed.createComponent(Recommender);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
