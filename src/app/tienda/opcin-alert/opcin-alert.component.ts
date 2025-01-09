import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-opcin-alert',
  templateUrl: './opcin-alert.component.html',
  styleUrls: ['./opcin-alert.component.scss']
})
export class OpcinAlertComponent implements OnInit {
  decision: 'bacs' | 'cod' = 'bacs';
  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<OpcinAlertComponent>,
    @Inject(MAT_DIALOG_DATA) public datas: any,
  ) { 
    this.decision = this.datas.opt;
    console.log("***17", this.decision)
  }

  ngOnInit(): void {
  }

  submit(){
    console.log("***16", this.decision );
    this.dialogRef.close( this.decision );
  }

}
