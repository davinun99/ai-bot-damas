import {GANAN_BLANCAS, GANAN_NEGRAS, JUEGO_INCONCLUSO} from '../helpers/constants';
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
    /**
     * Obtiene una lista con los todos los posibles movimientos a
     * realizar dada una posición específica y un tipo de jugador.
     * @param {*} ficha 
     * @param {*} jugador 
     * @param {*} esDama 
     * @returns 
     */
    getMovimientos(ficha, jugador, esDama = false) { //ficha = [fila, columna] - jugador = 1 | 2
        // TODO: MOVIMIENTOS POSIBLES DE UN PEON, DE UNA DAMA, DEL BLANCO, DEL NEGRO
        // TODO: VALIDAR QUE EL MOVIMIENTO ESTÉ DENTRO DEL TABLERO
        const [fila, columna] = ficha;

        const movimientosPosibles = [
            [fila + 1, columna + 1],
            [fila + 1, columna - 1],
            [fila - 1, columna + 1],
            [fila - 1, columna - 1],
        ];
        const movimientosValidos = [];

        for (let movimiento of movimientosPosibles) {
            let esValido = !this.getHayAliadoEnPosicion(jugador, movimiento);
            if (!esValido) continue;
            
            let puedeCapturar = this.getEsMovimientoDeCatura(ficha, jugador, movimiento);
            let esEspacioVacio = this.getEsVacio(movimiento);
            if (puedeCapturar || esEspacioVacio) {
                movimientosValidos.push({
                    movimiento,
                    puedeCapturar
                })
            }
        }
        return movimientosValidos;
    }
    /**
     * Determina si, dada una posición inicial y una posición siguiente,
     * es posible capturar la pieza que se encuentre en la posición siguiente.
     * Para eso, se verifica que la posición donde debe saltar la pieza dada por
     * ficha se encuentra despejada.
     * @param {*} ficha es la posición inicial
     * @param {*} jugador puede ser 1 o 2
     * @param {*} movimiento es la posición siguiente
     * @returns si es posible capturar una la ficha enemiga
     */
    getEsMovimientoDeCatura(ficha, jugador, movimiento) {
        // VERIFICAR QUE HAYA UN ENEMIGO EN LA POSICIÓN DADA POR "movimiento"
        // SI HAY UN ENEMIGO Y LA POSICIÓN POSTERIOR A LA CAPTURA ES UN ESPACIO VACÍO, RETORNAR TRUE
        const [movFila, movColumna] = movimiento;
        const [fila, columna] = ficha;

        const hayEnemigo = this.getHayEnemigoEnPosicion(jugador, movimiento);
        if (hayEnemigo) {
            const [varFila, varColumna] = [movFila - fila, movColumna - columna];
            const posicionPostCaptura = [movFila + varFila, movColumna + varColumna];
            return this.getEsVacio(posicionPostCaptura);
        }
        return false;
    }
    /**
     * Dado un jugaror (1 | 2) verifica si la posición dada 
     * contiene una pieza del mismo tipo.
     * @param {*} jugador puede ser 1 o 2
     * @param {*} posicion es la posición en el tablero a verificar
     * @returns si la posición dada es del mismo tipo que el jugador
     */
    getHayAliadoEnPosicion(jugador, posicion) {
        const [fila, columna] = posicion;
        return this.table[fila][columna] === jugador;
    }
    /**
     * Dado un jugaror (1 | 2) verifica si la posición dada 
     * contiene una pieza del tipo opuesto.
     * @param {*} jugador puede ser 1 o 2
     * @param {*} posicion es la posición en el tablero a verificar
     * @returns si la posición dada es del tipo contrario que el jugador
     */
    getHayEnemigoEnPosicion(jugador, posicion) {
        const [fila, columna] = posicion;
        return !this.getEsVacio(posicion) && this.table[fila][columna] !== jugador;
    }
    /**
     * Verifica si una posición dada no contiene ninguna pieza
     * @param {*} posicion es la posición en el tablero a verificar
     * @returns true si la posición dada no está ocupada por ninguna pieza
     */
    getEsVacio(posicion) {
        const [fila, columna] = posicion;
        return this.table[fila][columna] === 0;
    }
    jugar(fila, columna, jugador){ //Fila = 0-8, Columna = 0-8, Jugador = 1 | 2
        this.table[fila][columna] = jugador;
    }
}
export default Tablero;