import { HttpClient } from '@angular/common/http';
import { Component, OnInit, InjectionToken, Inject, Injectable, forwardRef } from '@angular/core';
import { inject } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppConfig, AppState, APP_CONFIG } from 'src/app/app.module';
import { DestinoViaje } from '../../models/destino-viaje.model';
import { DestinosApiClient } from '../../models/destinos-api-client.model';

//inicio caso
class DestinosApiClientViejo { // para usar el useExisting tienen que tener funciones compatibles como el getById
  getById(id: String): DestinoViaje {
    console.log('llamando la vieja clase');
    return null;
  }
}
//solicitud de loggear cada vez que se llama el getById
//se crea este metodo(APP_CONFIG- ya eliminado por encontrarse en module.ts) debido a que se crea la variable config y se desea asignarle un valor puntual
//InjectionToken- ayuda a injectar el valor especifico, el new asigna cualquier valor

@Injectable()
class DestinosApiClientDecorated extends DestinosApiClient {//se herada el destinoapiclient
  // constructor(@Inject(APP_CONFIG) private config: AppConfig, store: Store<AppState>) { //ya hay un store provate que viene heredado, pero si se pasa la variable
  constructor(store: Store<AppState>,
		@Inject(forwardRef(() => APP_CONFIG)) config: AppConfig,
    http: HttpClient
    ) { //ya hay un store private que viene heredado, pero si se pasa la variable
    super(store, config, http);
    // super(store);
  }
  getById(id: string): DestinoViaje {
    console.log('llamando por la clase decorada!');
    return super.getById(id);
  }
}
//fin caso(tener en cuenta providers)

@Component({
  selector: 'app-destino-detalle',
  templateUrl: './destino-detalle.component.html',
  styleUrls: ['./destino-detalle.component.css'],
  providers: [ //anula el comportamiento del providers en el module.ts general
    { provide: DestinosApiClient, useClass: DestinosApiClientDecorated },//el apli client usa el decorado
    { provide: DestinosApiClientViejo, useExisting: DestinosApiClient } //el viejo usa api client    
   ] 
})
export class DestinoDetalleComponent implements OnInit {
  destino: DestinoViaje;
  style = {
    sources: { // al usar source que no es de mapbox se ahorra poner un token de seguridad creando cuenta de mapbox
      world: {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json'
      },
    },
    version: 8,
    layers: [{
      'id': 'countries',
      'type': 'fill',
      'source': 'world',
      'layout': {},
      'paint': {
        'fill-color': '#6F788A'
      },
    }],
  };

  constructor(private route: ActivatedRoute, private destinosApiClient: DestinosApiClientViejo) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.destino = this.destinosApiClient.getById(id);
  }

}