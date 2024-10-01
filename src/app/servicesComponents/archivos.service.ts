import { Injectable } from '@angular/core';
import { ServiciosService } from '../services/servicios.service';
import * as firebase from "firebase/app";
import 'firebase/storage';
// import { getApp } from "firebase/app";
// import { getStorage } from "firebase/storage";
@Injectable({
  providedIn: 'root'
})
export class ArchivosService {

  constructor(
    private _model: ServiciosService
  ) { }

  create(query:any){
    //this.FileFirebase( query );
    //return this._model.querys('archivos/file',query, 'post');
    return this._model.querys2('archivos/file',query, 'post');
  }

  createGif(query:any){
    //this.FileFirebase( query );
    return this._model.querys2('archivos/fileGif',query, 'post');
  }

  FileFirebase( ev:any ){
    var firebaseConfig = {
      apiKey: "AIzaSyB5D8M8DRxmHU_Awwo7Yk41ei_Me0RU5Io",
      authDomain: "locomproaqui-e5fb7.firebaseapp.com",
      databaseURL: "https://locomproaqui-e5fb7.firebaseapp.com/",
      storageBucket: "locomproaqui-e5fb7.appspot.com"
    };
    firebase.initializeApp(firebaseConfig);
    let storageRef = firebase.storage().ref('images/'+ev.name || 'pruebas');

    let task = storageRef.put(ev).then(res=>console.log(res));
  }


  VideoFirebase(ev:any,nameFile:string){
    return new Promise((resolve, reject)=>{
      let rta
      // try{
        var firebaseConfig = {
          authDomain: "shoppalmastore.appspot.com",
          databaseURL: "https://locomproaqui-e5fb7.firebaseapp.com/",
          storageBucket: "shoppalmastore.appspot.com"
        };
        firebase.initializeApp(firebaseConfig);
        let storageRef = firebase.storage().ref(nameFile || 'prueba'); //ev.name

        rta = storageRef.put(ev).then(res=>{
          console.log("res",res)
          if(res.state=="success"){
            //obteniedo el token
            fetch("https://firebasestorage.googleapis.com/v0/b/shoppalmastore.appspot.com/o/"+ res.metadata.fullPath)
            .then(response=>response.json())
            .then(data=>{
              //console.log("res token",data.downloadTokens)
              rta = data.downloadTokens
              resolve(rta)
            })
            // console.log("state",res.state)
          }else{
            rta =  "no"
            reject(rta)
          }

        });
    //   }catch(err){  console.log("err",err)
    //     rta= "Ocurrió un problema, recarga la página."
    //     reject(rta)
    //  }
    })
  }


}


