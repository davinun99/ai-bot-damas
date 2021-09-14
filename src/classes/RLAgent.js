
import {GANAN_BLANCAS, GANAN_NEGRAS} from '../helpers/constants'
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
    calcularReward( tablero, jugador ){ //Tablero = Tablero(), jugador = 1 |2
        const result = tablero.calcularResultado();
        if( (result === GANAN_BLANCAS && jugador === 2) || (result === GANAN_NEGRAS && jugador === 1) ){
            return 1;
        }else if( (result === GANAN_BLANCAS && jugador === 2) || (result === GANAN_NEGRAS && jugador === 1) ){
            return 0;
        }
        //TODO: AGREGAR CONDICIONALES QUE USEN LAS PIEZAS U OTRAS VARIABLES 
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
        let prob = this.calcularReward(tablero, jugador);
        prob = prob + this.alpha * (probSgteEstado - prob);//No se si podemos usar asi o cambiar 
        const serialTablero = tablero.serializarTablero();
        this.lookupTable[serialTablero] = prob;
    }
    jugar( jugador ){//jugador= 1 | 2
        //TODO: ADAPTAR A DAMAS
        let fila, columna = 0;
        let prob, maxProb = Number.MIN_VALUE;
        const table = this.tablero.table
        for (let i = 0; i < table.length; i++) {
            for (let j = 0; j < table[i].length; j++) {
                if( table[i][j] === 0 ){
                    table[i][j] = jugador;
                    prob = this.calcularReward(this.tablero, jugador);
                    if( prob > maxProb){
                        maxProb = prob;
                        fila = i;
                        columna = j
                    }
                    table[i][j] = 0;
                }
            }
        }
        if(this.estaEntrenando){
            this.actualizarProbabilidad(this.ultimoTablero, maxProb, jugador);
        }
    }
}