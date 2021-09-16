
import {GANAN_BLANCAS, GANAN_NEGRAS} from '../helpers/constants'
import Tablero from './Tablero';
export default class RLAgent{
    lookupTable = {};//Hash map
    tablero = new Tablero();//Tablero actual
    alpha = 0.0;
    estaEntrenando = true;//Parametro para actualizar o no la tabla
    resultadoDelJuego;
    ultimoTablero;//Auxiliar con el ultimo tablero usado
    qRate = 0.1;
    N;
    constructor( N ){
        this.N = N;
        this.lookupTable = {};
    }
    getProbabilidad( tablero ){//Tablero = Tablero()
        const serialTablero = tablero.serializarTablero();
        if( typeof this.lookupTable[serialTablero] === 'undefined' ){
            this.lookupTable[serialTablero] = 0.5;//No se si se el valor inicial 
            return 0.5;
        }
        return this.lookupTable[serialTablero];
    }
    actualizarProbabilidad( tablero, probSgteEstado, jugador ){//Tablero = Tablero(), jugador= 1 | 2
        let prob = this.tablero.getRewardByJugador(jugador);
        prob = prob + this.alpha * (probSgteEstado - prob);//No se si podemos usar asi o cambiar 
        const serialTablero = this.tablero.serializarTablero();
        this.lookupTable[serialTablero] = prob;
    }
    jugar( jugador ){//jugador= 1 | 2
        //ELITISTA?
        let jugadaARealizar;
        let prob, maxProb = -1;
        const table = this.tablero.table    
        const jugadas = this.tablero.getAllJugadas(jugador);
        for (const jugada of jugadas) {//recorrer las jugadas posibles
            const copiaTablero = this.tablero.clonarTablero();
            this.tablero.jugar(jugada);
            prob = this.tablero.getRewardByJugador(jugador);
            //calcular reward del tablero formado
            if(prob > maxProb){
                maxProb = prob;//Actualizar maximo reward
                jugadaARealizar = jugada;
            }
            this.tablero.table = copiaTablero;
        }
        if(this.estaEntrenando){
            this.actualizarProbabilidad(this.ultimoTablero, maxProb, jugador);
        }
        if(jugadaARealizar){
            this.tablero.jugar(jugadaARealizar);
            const copiaTablero = this.tablero.clonarTablero();
            this.ultimoTablero = new Tablero(copiaTablero);
        }
    }
}