<template>
  <q-page class="flex flex-center column">
    <br>
    {{selectedElement}}
    {{movimientosPosibles}}
    <p v-if="estaEntrenado">Estoy entrenando.... >:)</p>
    <div v-else>
      <div v-for="(fila, index) of tabla" :key="index" class="row">
        <div v-for="(elem, indexElem) of fila" :key="indexElem">
          <div class="empty-space text-white" :class="(indexElem + index) % 2 ? 'empty-black' : 'empty-red'">
            <q-btn flat v-if="elem === 1 || elem === 2" 
              @click="select([index, indexElem], elem !== 1, elem)" class="pawn" 
              :class="[elem === 1 ? 'black-pawn' : 'white-pawn', { 'selected': index === selectedElement[0] && indexElem === selectedElement[1] }]" />
            <q-btn flat v-else-if="elem === 8 || elem === 9" 
              @click="select([index, indexElem], elem !== 8)" class="pawn" 
              :class="[elem === 8 ? 'black-pawn' : 'white-pawn', { 'selected': index === selectedElement[0] && indexElem === selectedElement[1] }]" />
            <q-btn flat v-else 
              @click="selectMovement([index, indexElem])" class="pawn" />
          </div>
        </div>
      </div>
      <p v-if="juegaAgente" v-bind:style="{textAlign:'center'}">Juega Agente</p>
      <p v-else v-bind:style="{textAlign:'center'}">Juega random!</p>
      <p v-if="agenteRl.estaEntrenando">Entrenando...</p>
      <p v-else>Modo serio...</p>
      <button @click="sgteJugada()">Siguiente jugada</button>
      <button @click="cancelarEntrenamiento()">Dejar de entrenar!</button>
  </div>
  </q-page>
</template>

<script>
import Tablero from 'src/classes/Tablero.js';
//código a borrar Mati
import MinimaxPodaAlfaBeta from 'src/classes/MinimaxPodaAlfaBeta.js';

import RLAgent from 'src/classes/RLAgent.js';
export default {
  name: 'Index',
  data() {
    return {
      estaEntrenado: false,
      jugadorActual: 2,
      interactive: true,
      selectedElement: [],
      movimientosPosibles: [],
      //codigo a borrar Mati
      imprimir: null,
      agenteRl: null,
      minimaxPoda: null,
      tablero: null,
    }
  },
  methods: {
    select(indexElem, canMove, jugador = 2) {
      if (!this.interactive || !canMove) return;
      this.selectedElement = indexElem;
      this.movimientosPosibles = this.tablero.getJugadasByFicha(indexElem, jugador);
    },
    sgteJugada(){
      if( this.jugadorActual === 1 ){
        console.log('Juega Agente');
        this.agenteRl.jugar(1);
        //this.tablero.jugarRandom(1);
      }else{
        console.log('Juega Minimax');
        this.minimaxPoda.jugar();
      }
      //this.agenteRl.expectarPartidaVsRandom(this.jugadorActual, this.jugadorActual === 1);
      this.jugadorActual = (this.jugadorActual % 2) + 1;
    },
    cancelarEntrenamiento(){
      this.agenteRl.resetearTablero();
      this.agenteRl.estaEntrenando = false;
      this.agenteRl.alpha = 0.6;
    },
    selectMovement(posicion) {
      // console.log('posicion de movimiento:', posicion);
      // console.log('this.movimientosPosibles', this.movimientosPosibles);
      if (!this.selectedElement) return;
      for (let movimientoPosible of this.movimientosPosibles) {
        if (movimientoPosible.movimiento[0] === posicion[0] && 
            movimientoPosible.movimiento[1] === posicion[1]) {
          this.tablero.jugar({...movimientoPosible, ficha: this.selectedElement});
          this.handleTerminarTurnoDeHumano();
          break;
        }
      }
    },
    handleTerminarTurnoDeHumano() {
      this.interactive = false;
      this.selectedElement = [];
      this.movimientosPosibles = [];
      //this.agenteRl.tablero.dibujarTablero();
      setTimeout(()=>{
        //this.agenteRl.tablero.jugarRandom(1);
        //this.agenteRl.jugar(1);
        this.minimaxPoda.jugar();
        this.interactive = true;
      }, 400);
      //this.agenteRl.tablero.dibujarTablero();
    }
  },
  computed: {
    tabla() {
      return this.tablero ? this.tablero.table : '';
    },
    juegaAgente(){
      return this.jugadorActual === 1;
    }
  },
  created() {
    this.tablero = new Tablero();
    this.agenteRl = new RLAgent(5, this.tablero);
    //código a borrar Mati
    
    //this.minimaxPoda = new MinimaxPodaAlfaBeta(2, this.tablero);
    this.minimaxPoda = new MinimaxPodaAlfaBeta(1, this.tablero);

    //codigo a borrar Mati
    // this.minimaxPoda.jugar();
    // const jugada = this.agenteRl.jugar(1);
    //this.agenteRl.tablero.dibujarTablero();
    //this.agenteRl.entrenarVsRandom();
    this.agenteRl.estaEntrenado = false;
    this.agenteRl.alpha = 0.5;
  }
}
</script>

<style scoped>
.empty-space:hover {
  opacity: 0.5;
}
.empty-space {
  width: min(10vw, 10vh);
  height: min(10vw, 10vh);
  border: 1px solid white;
  padding: 5px;
}
.empty-black {
  background-color: #000b;
}
.empty-red {
  background-color: red;
}
.pawn {
  width: 100%;
  height: 100%;
  border-radius: 100%;
  border: 1px solid #999;
}
.black-pawn {
  background-color: black;
}
.white-pawn {
  background-color: white;
}
.selected {
  background-color: #999;
  border: 2px solid white;
  transform: scale(1.1);
}
</style>