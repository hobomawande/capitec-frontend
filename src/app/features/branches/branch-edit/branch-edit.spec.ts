import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BranchEdit } from './branch-edit';

describe('BranchEdit', () => {
  let component: BranchEdit;
  let fixture: ComponentFixture<BranchEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(BranchEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
