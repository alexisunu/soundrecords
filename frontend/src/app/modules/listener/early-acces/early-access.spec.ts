import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { EarlyAccess } from './early-access';

describe('EarlyAccess', () => {
  let component: EarlyAccess;
  let fixture: ComponentFixture<EarlyAccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EarlyAccess],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(EarlyAccess);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
