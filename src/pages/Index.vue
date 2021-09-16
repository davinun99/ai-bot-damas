<template>
  <q-page class="flex flex-center column">
    {{selectedElement}}
    {{movimientosPosibles}}
    <div v-for="(fila, index) of tabla" :key="index" class="row">
      <div v-for="(elem, indexElem) of fila" :key="indexElem">
        <div class="empty-space text-white" :class="(indexElem + index) % 2 ? 'empty-black' : 'empty-red'">
          <q-btn flat v-if="elem === 1 || elem === 2" 
            @click="select([index, indexElem], elem !== 1, elem)" class="pawn" 
            :class="[elem === 1 ? 'black-pawn' : 'white-pawn', { 'selected': index === selectedElement[0] && indexElem === selectedElement[1] }]" />
          <q-btn flat v-if="elem === 8 || elem === 9" 
            @click="select([index, indexElem], elem !== 8)" class="pawn" 
            :class="[elem === 8 ? 'black-pawn' : 'white-pawn', { 'selected': index === selectedElement[0] && indexElem === selectedElement[1] }]" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import Tablero from 'src/classes/Tablero.js';
import RLAgent from 'src/classes/RLAgent.js';
export default {
  name: 'Index',
  data() {
    return {
      interactive: true,
      selectedElement: [],
      movimientosPosibles: [],
      agenteRl: null,
    }
  },
  methods: {
    select(indexElem, canMove, jugador) {
      if (!this.interactive || !canMove) return;
      this.selectedElement = indexElem;
      this.movimientosPosibles = this.tablero.getJugadasByFicha(indexElem, jugador);
    },
  },
  computed: {
    tabla() {
      return this.agenteRl.tablero ? this.agenteRl.tablero.table : '';
    },
    tablero(){
      return this.agenteRl.tablero;
    }
  },
  created() {
    this.agenteRl = new RLAgent(10000);
    const jugada = this.agenteRl.jugar(1);
    //this.agenteRl.tablero.dibujarTablero();
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