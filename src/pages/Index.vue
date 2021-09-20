<template>
  <q-page class="flex flex-center column">
    
    <!-- HEADER -->

    <div class="row q-my-md">
      <q-btn-dropdown color="primary" :label="blancasJueganCon">
        <q-input class="q-ma-md" v-model="blancaN" label="N" />
        <q-separator />
        <q-list>
          <q-item v-for="juego of blancaJuegos" :key="juego" clickable v-close-popup @click="jugarCon(2, juego)">
            <q-item-section>
              <q-item-label>{{juego}}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>

      <div class="q-ma-md text-grey-8">VS.</div>

      <q-btn-dropdown color="primary" :label="negrasJueganCon">
        <q-input class="q-ma-md" v-model="negraN" label="N" />
        <q-separator />
        <q-list>
          <q-item v-for="juego of negraJuegos" :key="juego" clickable v-close-popup @click="jugarCon(1, juego)">
            <q-item-section>
              <q-item-label>{{juego}}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>

      <div class="q-ma-md text-grey-8">|</div>

      <q-btn v-if="!started" color="primary" @click="empezarPartida">
        <div class="q-mr-md">Empezar</div>
        <q-icon name="arrow_forward"></q-icon>
      </q-btn>
      <q-btn v-else color="negative" @click="terminarPartida">
        <div class="q-mr-md">Terminar</div>
        <q-icon name="close"></q-icon>
      </q-btn>
    </div>

    <!-- TABLE -->
    
    <div v-if="entrenandoNegras || entrenandoBlancas">
      Entrenando...
    </div>
    <div v-else-if="started">
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
      <p v-if="juegaAgente" v-bind:style="{textAlign:'center'}">Juega IA</p>
      <p v-else v-bind:style="{textAlign:'center'}">Juega rival!</p>
      <!-- <p v-if="agenteRl.estaEntrenando">Entrenando...</p> -->
      <!-- <p v-else>Modo serio...</p> -->
      <button @click="sgteJugada()">Siguiente jugada</button>
      <button @click="cancelarEntrenamiento()">Dejar de entrenar!</button>-->
    </div>
  </q-page>
</template>

<script>
import Tablero from 'src/classes/Tablero.js';
import MinimaxPodaAlfaBeta from 'src/classes/MinimaxPodaAlfaBeta.js';
import Minimax from 'src/classes/Minimax.js';

const blancaJuegos = ['Humano', 'Aprendizaje Reforzado', 'Minimax', 'Minimax con poda alfa-beta'];
const negraJuegos = ['Aprendizaje Reforzado', 'Minimax', 'Minimax con poda alfa-beta'];

import RLAgent from 'src/classes/RLAgent.js';
export default {
  name: 'Index',
  data() {
    return {
      started: false,
      jugadorActual: 2,
      interactive: true,
      selectedElement: [],
      movimientosPosibles: [],
      //codigo a borrar Mati
      imprimir: null,
      agenteRl: null,
      minimaxPoda: null,
      tablero: null,
      minimaxPodaRival: null,

      entrenandoBlancas: false,
      entrenandoNegras: false,
      blancaJuegos,
      negraJuegos,
      blancasJueganCon: blancaJuegos[0],
      negrasJueganCon: negraJuegos[0],
      negraN: 1,
      blancaN: 1,
      jugadorNegro: null,
      jugadorBlanco: null,
    }
  },
  methods: {
    empezarPartida() {
      //
      // Inicializar piezas negras
      //
      if (this.negrasJueganCon === negraJuegos[0]) { // RL
      this.entrenandoNegras = true;
        this.jugadorNegro = new RLAgent(1, this.negraN, this.tablero);
        this.jugadorNegro.entrenar();
        this.jugadorNegro.estaEntrenando = false;
        this.entrenandoNegras = false;
      } else if (this.negrasJueganCon === negraJuegos[1]) { // MimiMax
        this.jugadorNegro = new Minimax(1, this.negraN, this.tablero);
      } else if (this.negrasJueganCon === negraJuegos[2]) { // MimiMax con poda alfa-beta
        this.jugadorNegro = new MinimaxPodaAlfaBeta(1, this.negraN, this.tablero);
      }
      //
      // Inicializar piezas blancas
      //
      if (this.blancasJueganCon === blancaJuegos[1]) { // RL
        this.entrenandoBlancas = true;
        this.jugadorBlanco = new RLAgent(2, this.blancaN, this.tablero);
        this.jugadorBlanco.entrenar(); 
        this.jugadorBlanco.estaEntrenando = false;
        this.entrenandoBlancas = false;
      } else if (this.blancasJueganCon === blancaJuegos[2]) { // MimiMax
        this.jugadorBlanco = new Minimax(2, this.blancaN, this.tablero);
      } else if (this.blancasJueganCon === blancaJuegos[3]) { // MimiMax con poda alfa-beta
        this.jugadorBlanco = new MinimaxPodaAlfaBeta(2, this.blancaN, this.tablero);
      }
      //
      // Empezar
      //
      this.started = true;
      //
      // JUGAR MAQUINA VS MAQUINA
      //
      if (this.blancasJueganCon !== blancaJuegos[0]) {
        this.jugarMaquinas();
      }
    },
    jugarMaquinas() {
      if (!this.started) return;
      this.jugadorBlanco.jugar();
      setTimeout(() => {
        if (!this.started) return;
        this.jugadorNegro.jugar();
        setTimeout(() => {
          if (!this.started) return;
          this.jugarMaquinas();
        }, 500);
      }, 500);
    },
    terminarPartida() {
      this.tablero.resetearTablero();
      this.started = false;
    },
    jugarCon(jugador, juego) {
      if (jugador === 1) this.negrasJueganCon = juego; 
      else if (jugador === 2) this.blancasJueganCon = juego; 
    },
    select(indexElem, canMove, jugador = 2) {
      if (!this.interactive || !canMove || this.blancasJueganCon !== blancaJuegos[0]) return;
      this.selectedElement = indexElem;
      this.movimientosPosibles = this.tablero.getJugadasByFicha(indexElem, jugador);
    },
    sgteJugada(){
      if( this.jugadorActual === 1 ){
        console.log('Juega Rival');
        
        this.minimaxPodaRival.jugar();
      }else{
        console.log('Juega Minimax');
        this.minimaxPoda.jugar();
      }
      this.jugadorActual = (this.jugadorActual % 2) + 1;
    },
    cancelarEntrenamiento(){
      this.agenteRl.resetearTablero();
      this.agenteRl.estaEntrenando = false;
      this.agenteRl.alpha = 0.6;
    },
    selectMovement(posicion) {
      
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
      
      setTimeout(()=>{
        this.jugadorNegro.jugar();
        this.interactive = true;
      }, 400);
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
    
    this.minimaxPoda = new MinimaxPodaAlfaBeta(1, this.tablero);
    this.minimaxPodaRival = new MinimaxPodaAlfaBeta(2, this.tablero);
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