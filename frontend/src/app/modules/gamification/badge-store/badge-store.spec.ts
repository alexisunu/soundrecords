import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgeStore } from './badge-store';

describe('BadgeStore', () => {
  let component: BadgeStore;
  let fixture: ComponentFixture<BadgeStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BadgeStore],
    }).compileComponents();

    fixture = TestBed.createComponent(BadgeStore);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
