import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IncidencesPage } from './incidences.page';

describe('IncidencesPage', () => {
  let component: IncidencesPage;
  let fixture: ComponentFixture<IncidencesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(IncidencesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
