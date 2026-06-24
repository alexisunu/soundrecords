import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtistPublic } from './artist-public';

describe('ArtistPublic', () => {
  let component: ArtistPublic;
  let fixture: ComponentFixture<ArtistPublic>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtistPublic],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtistPublic);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
