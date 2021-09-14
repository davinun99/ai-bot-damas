import {GANAN_BLANCAS, GANAN_NEGRAS, JUEGO_INCONCLUSO} from './js/constants'
const getInitialTable = () => ([
    [1, 0, 1, 0, 1, 0, 1, 0], //1 SON NEGRAS
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 2, 0, 2, 0, 2, 0],
    [0, 2, 0, 2, 0, 2, 0, 2], //2 SON BLANCAS
    [2, 0, 2, 0, 2, 0, 2, 0],
]);
class Tablero {
    table = getInitialTable();
    cantPiezasBlancas = 12;
    cantPiezasNegras = 12;
    calcularResultado(){
        return (this.cantPiezasBlancas === 0 ? GANAN_NEGRAS : (this.cantPiezasNegras === 0 ? GANAN_BLANCAS : JUEGO_INCONCLUSO))
    }
    serializarTablero(){
        return this.table.reduce((prev, curr)=>(`${prev}${curr}`),'');
    }
    dibujarTablero(){
        for (let i = 0; i < this.table.length; i++) {
            for (let j = 0; j < this.table[i].length; j++) {
                const pieza = this.table[i][j] === 1 ? 'N' : ( this.table[i][j] === 2 ? 'B' : ' ' );
                console.log( pieza + '\t');
            }
            console.log( '\n');
        }
    }
    jugar(fila, columna, jugador){
        this.table[fila][columna] = jugador;
    }
}
class RLAgent{
    lookupTable = {};
    tablero = new Tablero();
    alpha = 0.0;
    estaEntrenando = true;
    resultadoDelJuego;
    ultimoTablero;
    qRate = 0.1;
    N;
    constructor( N ){
        this.N = N;
        this.lookupTable = {};
    }
    calcularReward( tablero, jugador ){
        const result = tablero.calcularResultado();
        if( (result === GANAN_BLANCAS && jugador === 2) || (result === GANAN_NEGRAS && jugador === 1) ){
            return 1;
        }else if( (result === GANAN_BLANCAS && jugador === 2) || (result === GANAN_NEGRAS && jugador === 1) ){
            return 0;
        }
        //TODO: AGREGAR CONDICIONALES QUE USEN LAS PIEZAS U OTRAS VARIABLES 
    }
    getProbabilidad( tablero ){
        const serialTablero = tablero.serializarTablero();
        if( typeof this.lookupTable[serialTablero] === 'undefined' ){
            this.lookupTable[serialTablero] = 0.5;
            return 0.5;
        }
        return this.lookupTable[serialTablero];
    }
    actualizarProbabilidad( tablero, probSgteEstado, jugador ){
        let prob = this.calcularReward(tablero, jugador);
        prob = prob + this.alpha * (probSgteEstado - prob);
        const serialTablero = tablero.serializarTablero();
        this.lookupTable[serialTablero] = prob;
    }
    jugar( jugador ){//TODO: ADAPTAR A DAMAS
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