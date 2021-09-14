import {GANAN_BLANCAS, GANAN_NEGRAS, JUEGO_INCONCLUSO} from './js/constants'
const getInitialTable = () => ([ //
    [1, 0, 1, 0, 1, 0, 1, 0], //1 SON NEGRAS
    [0, 1, 0, 1, 0, 1, 0, 1], //8 SON DAMAS NEGRAS
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 2, 0, 2, 0, 2, 0],
    [0, 2, 0, 2, 0, 2, 0, 2], //2 SON BLANCAS
    [2, 0, 2, 0, 2, 0, 2, 0], //9 SON DAMAS BLANCAS
]);
class Tablero {
    table = getInitialTable(); //Tablero de damas 
    cantPeonesBlancos = 12;
    cantDamasBlancas = 0;
    cantPeonesNegros = 12;
    cantDamasNegras = 0;
    get cantFichasBlancas(){
        return this.cantPeonesBlancos + this.cantDamasBlancas;
    }
    get cantFichasNegras(){
        return this.cantPeonesNegros + this.cantDamasNegras;
    }
    calcularResultado(){ //si ya no hay piezas de un jugador osi es que hay el juego sigue
        return (this.cantPiezasBlancas === 0 ? GANAN_NEGRAS : (this.cantPiezasNegras === 0 ? GANAN_BLANCAS : JUEGO_INCONCLUSO))
    }
    serializarTablero(){ //Convierte todo el tablero a un string
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
    getFichas(jugador){ //jugador = 1 | 2
        const fichas = [];
        for (let i = 0; i < this.table.length; i++) {
            for (let j = 0; j < this.table[i].length; j++) {
                if( this.table[i][j] === jugador || this.table[i][j] === jugador + 7 ){
                    fichas.push({fila:i, columna: j});
                }
            }
        }
        return fichas;
    }
    getMovimientos(ficha, jugador){ //ficha = { fila: 0, columna: 0} jugador = 1 | 2
        const movimientos = [];//TODO: MOVIMIENTOS POSIBLES DE UN PEON, DE UNA DAMA, DEL BLANCO, DEL NEGRO
        if(jugador === 1){
            if( ficha.fila === 0 ){
                
            }
        }
    }
    jugar(fila, columna, jugador){ //Fila = 0-8, Columna = 0-8, Jugador = 1 | 2
        this.table[fila][columna] = jugador;
    }
}
class RLAgent{
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
            this.lookupTable[serialTablero] = 0.5;
            return 0.5;
        }
        return this.lookupTable[serialTablero];
    }
    actualizarProbabilidad( tablero, probSgteEstado, jugador ){//Tablero = Tablero(), jugador= 1 | 2
        let prob = this.calcularReward(tablero, jugador);
        prob = prob + this.alpha * (probSgteEstado - prob);
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