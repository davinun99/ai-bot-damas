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
        return this.table.reduce((textSerialFinal, fila)=>(`${textSerialFinal}${
            fila.reduce( (textTotalColumna, valorMat) => `${textTotalColumna}${valorMat}`, '' )
        }`),'');
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
     * @returns 
     */
    getMovimientosPosibles(ficha, jugador){
        const [fila, columna] = ficha;
        const esDama = this.table[fila][columna] >= 5;
        let movimientos = []
        if(esDama){
            const direccionesValidas = new Array(4).fill(true);
            const esValido = (posicion, direccion) => {
                if( !this.getEstaEnTablero(posicion) ){
                    return false;
                }
                const hayAliado = this.getHayAliadoEnPosicion( jugador, posicion);
                const hayEnemigo = this.getHayEnemigoEnPosicion( jugador, posicion);
                if(hayAliado){
                    direccionesValidas[direccion] = false;
                }else if(hayEnemigo){
                    direccionesValidas[direccion] = false;
                    return true;
                }
                return direccionesValidas[direccion];
            }
            for (let i = 0; i < this.table.length; i++) {
                const movimientosPosiblesDama = [
                    [fila + (i + 1), columna + (i + 1)],
                    [fila + (i + 1), columna - (i + 1)],
                    [fila - (i + 1), columna + (i + 1)],
                    [fila - (i + 1), columna - (i + 1)],
                ];
                for (let j = 0; j < movimientosPosiblesDama.length; j++) {
                    if(esValido(movimientosPosiblesDama[j], j )) 
                        movimientos.push( movimientosPosiblesDama[j] );
                }
            }
        }else{
            const desplazamiento = jugador === 2 ? -1 : 1;
            movimientos = [
                [fila + desplazamiento, columna + 1],
                [fila + desplazamiento, columna - 1],
            ];
        }   
        return movimientos;
    }
    getEstaEnTablero( [fila, columna] ){
        return( fila >= 0 && columna>= 0 && fila < this.table.length && columna < this.table[0].length );
    }
    removerMovimientosDuplicados(movimientosValidos){
        const hashMovimientosValidos = movimientosValidos.reduce( (prev, curr) => {
            const [fila, columna] = curr.movimiento;
            const hashIndex = fila+''+columna;
            return {
                ...prev,
                [hashIndex]: {
                    ...curr,
                    puedeCapturar: (prev[hashIndex] || {}).puedeCapturar || curr.puedeCapturar
                }
            };
        }, {} ); 
        return Object.values(hashMovimientosValidos);
    }
    getMovimientos(ficha, jugador) { //ficha = [fila, columna] - jugador = 1 | 2
        // TODO: MOVIMIENTOS POSIBLES DE UN PEON, DE UNA DAMA, DEL BLANCO, DEL NEGRO
        // TODO: VALIDAR QUE EL MOVIMIENTO ESTÉ DENTRO DEL TABLERO
        const movimientosPosibles = this.getMovimientosPosibles(ficha, jugador);
        const movimientosValidos = [];
        for (const movimiento of movimientosPosibles) {
            const esValido = this.getEstaEnTablero(movimiento) && !this.getHayAliadoEnPosicion(jugador, movimiento);
            if (!esValido) continue;
            
            const puedeCapturar = this.getEsMovimientoDeCaptura(ficha, jugador, movimiento);
            const esEspacioVacio = this.getEsVacio(movimiento);
            if (puedeCapturar || esEspacioVacio) { //TODO: CAMBIAR 
                const posicionesSiguientes = puedeCapturar ? this.getPosicionesPostCaptura(ficha, movimiento) : [movimiento];
                movimientosValidos.push( ...posicionesSiguientes.map( movimiento => ({movimiento, puedeCapturar }) ) );
            }
        }
        return this.removerMovimientosDuplicados(movimientosValidos);
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
    getEsMovimientoDeCaptura(ficha, jugador, movimiento) {
        // VERIFICAR QUE HAYA UN ENEMIGO EN LA POSICIÓN DADA POR "movimiento"
        // SI HAY UN ENEMIGO Y LA POSICIÓN POSTERIOR A LA CAPTURA ES UN ESPACIO VACÍO, RETORNAR TRUE
        const [movFila, movColumna] = movimiento;
        const [fila, columna] = ficha;
        const hayEnemigo = this.getHayEnemigoEnPosicion(jugador, movimiento);
        if (hayEnemigo) {
            const [varFila, varColumna] = [movFila - fila, movColumna - columna];
            const [unitVarFila, unitVarColumna] = [ varFila/Math.abs(varFila), varColumna/Math.abs(varColumna) ];
            let posicionActual = [ fila + unitVarFila, columna + unitVarColumna ];
            while( this.getEstaEnTablero( posicionActual ) ){
                if( posicionActual[0] === movimiento[0] && posicionActual[1] === movimiento[1] ){
                    break;
                }
                if( ! this.getEsVacio(posicionActual) ){
                    return false;
                }
                const [filaAnterior, columnaAnterior] = posicionActual;
                posicionActual = [filaAnterior + unitVarFila, columnaAnterior + unitVarColumna];
            }
            const posicionPostCaptura = [movFila + unitVarFila, movColumna + unitVarColumna];
            return this.getEstaEnTablero(posicionPostCaptura) && this.getEsVacio(posicionPostCaptura);
        }
        return false;
    }
    getPosicionesPostCaptura(ficha, movimiento){
        const [movFila, movColumna] = movimiento;
        const [fila, columna] = ficha;
        const [varFila, varColumna] = [movFila - fila, movColumna - columna];
        const [unitVarFila, unitVarColumna] = [ varFila/Math.abs(varFila), varColumna/Math.abs(varColumna) ];
        const esDama = this.table[fila][columna] > 5;
        const posicionesPostCaptura = [ [movFila + unitVarFila, movColumna + unitVarColumna] ];
        let posicionActual = [ movFila + 2*unitVarFila, movColumna + 2*unitVarColumna ];
        if(esDama){
            while( this.getEstaEnTablero( posicionActual ) && this.getEsVacio(posicionActual) ){
                posicionesPostCaptura.push(posicionActual);
                const [filaAnterior, columnaAnterior] = posicionActual;
                posicionActual = [filaAnterior + unitVarFila, columnaAnterior + unitVarColumna];
            }
        }
        return posicionesPostCaptura;
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