import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlbumProfile } from './album-profile';

describe('AlbumProfile', () => {
  let component: AlbumProfile;
  let fixture: ComponentFixture<AlbumProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlbumProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlbumProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});