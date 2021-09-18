import {EMPATE, GANAN_BLANCAS, GANAN_NEGRAS, JUEGO_INCONCLUSO} from '../helpers/constants';
import {getInitialTable} from '../helpers';
class Tablero {
    table = []; //Tablero de damas 
    constructor( table ){
        this.table = table || getInitialTable();
    }
    jugadorEsGanador(jugador){
        const resultado = this.calcularResultado();
        return jugador === 1 ? (resultado === GANAN_NEGRAS) : (resultado === GANAN_BLANCAS)
    }
    getCantidadDePieza( codPieza ){
        let cont = 0;
        for (const fila of this.table) {
            for( const celda of fila){
                if(celda === codPieza){ cont++ };
            }
        }
        return cont;
    }
    get cantPeonesBlancos(){
        return this.getCantidadDePieza(2);
    };
    get cantDamasBlancas(){
        return this.getCantidadDePieza(9);
    };
    get cantPeonesNegros(){
        return this.getCantidadDePieza(1);
    };
    get cantDamasNegras(){
        return this.getCantidadDePieza(8);
    };
    getTotalPuntos(jugador){
        if(jugador === 1){//ES NEGRAS
            return this.cantDamasNegras / 12 + this.cantPeonesNegros / 36;
        }else{
            return this.cantDamasBlancas / 12 + this.cantPeonesBlancos / 36;
        }
    }
    get cantFichasBlancas(){
        return this.cantPeonesBlancos + this.cantDamasBlancas;
    }
    get cantFichasNegras(){
        return this.cantPeonesNegros + this.cantDamasNegras;
    }
    getDamasByJugador(jugador){
        if(jugador === 1){//ES NEGRAS
            return this.cantDamasNegras;
        }else{
            return this.cantDamasBlancas;
        }
    }
    getFichasByJugador(jugador){
        if(jugador === 1){//ES NEGRAS
            return this.cantFichasNegras;
        }else {
            return this.cantFichasBlancas;
        }
    }
    calcularResultadoInt(){
        let resultado = 0;
        const esEmpate = this.getAllJugadas(1).length + this.getAllJugadas(2).length === 0;
        if(this.cantFichasNegras === 0){
            resultado = 2;//2 GANAN BLANCAS
        }else if(this.cantFichasBlancas === 0){
            resultado = 1; //1 GANAN NEGRAS
        }else if(esEmpate){
            resultado = 3;//EMPATE
        }
        return resultado;
    }
    calcularResultado(){ //si ya no hay piezas de un jugador osi es que hay el juego sigue
        //cambié el const por let para lo de abajo
        const ganador = (this.cantPiezasBlancas === 0 ? GANAN_NEGRAS : (this.cantPiezasNegras === 0 ? GANAN_BLANCAS : JUEGO_INCONCLUSO));
        //(Mati) añado esta línea para que también cuente como derrota cuando uno de los dos no tiene más movimientos
        //si te molesta quita sin problemas o cambia @David
        //ganador = (this.getAllJugadas(2) === 0 ? GANAN_NEGRAS : (this.getAllJugadas(1) === 0 ? GANAN_BLANCAS : JUEGO_INCONCLUSO));
        
        const esEmpate = this.getAllJugadas(1).length + this.getAllJugadas(2).length === 0;
        if(ganador!== JUEGO_INCONCLUSO){
            return ganador;
        }else if(esEmpate){
            return EMPATE;
        }else{
            return JUEGO_INCONCLUSO;
        }
    }
    serializarTablero(){ //Convierte todo el tablero a un string
        return this.table.reduce((textSerialFinal, fila)=>(`${textSerialFinal}${
            fila.reduce( (textTotalColumna, valorMat) => `${textTotalColumna}${valorMat}`, '' )
        }`),'');
    }
    dibujarTablero(){
        let str = '';
        const fichasPosibles = ['_','n','b','_','_','_','_','_','N','B'];
        for (let i = 0; i < this.table.length; i++) {
            for (let j = 0; j < this.table[i].length; j++) {
                const pieza = fichasPosibles[this.table[i][j]];
                str = str + pieza + '\t';
            }
            str = str + '\n';
        }
        console.log(str);
    }
    getFichas(jugador){ //jugador = 1 | 2
        const fichas = [];
        for (let i = 0; i < this.table.length; i++) {
            for (let j = 0; j < this.table[i].length; j++) {
                if( this.table[i][j] === jugador || this.table[i][j] === jugador + 7 ){
                    fichas.push( [i,j] );
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
            const desplazamiento = jugador === 2 ? -1 : 1; // Si son las blancas, el movimiento es hacia abajo(Arriba estan las filas mayores)
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
    getJugadaRandom(jugador){
        const jugadasPosibles = this.getAllJugadas(jugador);
        if(!jugadasPosibles.length){
            return null;
        }
        const randomIndex = Math.floor( Math.random() * jugadasPosibles.length );
        return jugadasPosibles[randomIndex];
    }
    jugarRandom(jugador){
        const jugadaRandom = this.getJugadaRandom(jugador);
        if(jugadaRandom){
            this.jugar(jugadaRandom);
            return true;
        }
        return false;
    }
    getAllJugadas(jugador){
        const jugadas = [] // [{ ficha, movimiento, haCapturado, capturados:[] }]
        for(const ficha of this.getFichas(jugador)){
            const jugadasFicha = this.getJugadasByFicha(ficha, jugador).map(mov => ({
                ...mov,
                ficha
            }));
            jugadas.push( ...jugadasFicha );
        }
        return jugadas;
    }
    clonarTablero(){
        return [...this.table.map(movs => [...movs])];
    }
    getJugadasByFicha(ficha, jugador){
        const tableroOriginal = this.clonarTablero();
        const movimientosFicha = this.getMovimientosByFicha(ficha, jugador);
        const movimientos = this.getJugadasByFichaRec(ficha, jugador, movimientosFicha);
        this.table = tableroOriginal;
        return movimientos;
    }
    getJugadasByFichaRec(ficha, jugador, movimientos){
        const movimientosFinales = [...movimientos];
        const [fila, col] = ficha;
        for (const movimiento of movimientos) {
            //Si se puede capturar mas fichas, siguen habiendo movimientos posibles
            if( movimiento.puedeCapturar ){
                const tableroActual = this.clonarTablero();
                const [movFila, movCol] = movimiento.movimiento;
                for (let i = 0; i < movimiento.fichasCapturadas.length; i++) {
                    const [filaCapt, colCapt] = movimiento.fichasCapturadas[i]
                    this.table[filaCapt][colCapt] = 0;    
                }
                this.table[movFila][movCol] = this.table[fila][col];
                this.table[fila][col] = 0;
                const sgtesMovimientosConCaptura = this.getMovimientosByFicha(movimiento.movimiento ,jugador).filter(mov=>mov.puedeCapturar);
                const sgtesJugadas = this.getJugadasByFichaRec( movimiento.movimiento, jugador, sgtesMovimientosConCaptura).map(
                    jugada => ({...jugada, 
                        fichasCapturadas: jugada.fichasCapturadas.concat(movimiento.fichasCapturadas)
                    })
                );
                movimientosFinales.push( ...sgtesJugadas );
                this.table = tableroActual;
            }
        }
        return movimientosFinales;
    }
    getRewardByJugador(jugador){
        const result = this.calcularResultadoInt();
        let reward = 0;//MAX REWARD POSIBLE = 1
        const contrario = (jugador % 2) + 1;
        if( result === jugador){
            reward = 1;//Si el jugador gana, damos el maximo reward
        }else if( result === contrario){
            reward = 0;//Si el jugador pierde, damos el peor reward
        }
        else if( this.getTotalPuntos(jugador) > this.getTotalPuntos(contrario) ){
            reward = 0.85;//Si el jugador consigue mas puntos x pieza, damos un buen reward
        }else if( this.getDamasByJugador(jugador) > this.getDamasByJugador(contrario) ){
            reward = 0.7;//Si el jugador obtiene mas damas, damos un reward
        }
        return reward;
    }
    getMovimientosByFicha(ficha, jugador) { //ficha = [fila, columna] - jugador = 1 | 2 ESTA FUNCION SOLO CONTEMPLA COMER UNA FICHA A LA VEZ
        const movimientosPosibles = this.getMovimientosPosibles(ficha, jugador);
        const movimientosValidos = [];
        for (const movimiento of movimientosPosibles) {
            const esValido = this.getEstaEnTablero(movimiento) && !this.getHayAliadoEnPosicion(jugador, movimiento);
            if (!esValido) continue;
            
            const puedeCapturar = this.getEsMovimientoDeCaptura(ficha, jugador, movimiento);
            const esEspacioVacio = this.getEsVacio(movimiento);
            if (puedeCapturar || esEspacioVacio) { //TODO: CAMBIAR 
                let posicionesSiguientes = [];
                let fichasCapturadas;
                if(puedeCapturar){
                    const {posicionesPostCaptura, posFichaCapturada } = this.getPosicionesPostCaptura(ficha, movimiento);
                    posicionesSiguientes = posicionesPostCaptura;
                    fichasCapturadas = [posFichaCapturada];
                }else{
                    posicionesSiguientes = [movimiento];
                }
                movimientosValidos.push( ...posicionesSiguientes.map( movimiento => ({movimiento, puedeCapturar, fichasCapturadas }) ) );
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
        return {posicionesPostCaptura, posFichaCapturada: movimiento};
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
        return this.table[fila][columna] === jugador || this.table[fila][columna] === jugador + 7;
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
        const enemigo = (jugador % 2) + 1;
        return this.table[fila][columna] === enemigo || this.table[fila][columna] === enemigo + 7;
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
    coronar(){//Verifica si hay peones en las ultimas lineas y los corona
        const len = this.table.length - 1;
        for (let i = 0; i < this.table[0].length; i++) {
            if( this.table[0][i] === 2 ){ //SI HAY UN PEON BLANCO EN LA PRIMERA FILA -> CORONAR
                this.table[0][i]+=7;
            }else if( this.table[len][i] === 1 ){//SI HAY UN PEON NEGRO EN LA ULTIMA FILA -> CORONAR
                this.table[len][i]+=7;
            }
        }
    }
    jugar(jugada){ //movimiento: {fila, columna}, puedeCapturar: boolean, fichasCapturadas:[{fila, columna}]}
        const {movimiento, puedeCapturar, fichasCapturadas, ficha} = jugada;
        const [fichaFila, fichaColumna] = ficha;
        const [movFila, movColumna] = movimiento;
        this.table[movFila][movColumna] = this.table[fichaFila][fichaColumna]; // MUEVO LA FICHA ACTUAL A SU POSICION LUEGO DE LA JUGADA
        this.table[fichaFila][fichaColumna] = 0;//LA POSICION VIEJA DE LA FICHA QUEDA VACIA
        puedeCapturar && fichasCapturadas && fichasCapturadas.forEach( ([captFila, captColumna])=> {//TODAS LAS POCISIONES QUE CAPTURA QUEDAN VACIAS
            this.table[captFila][captColumna] = 0;
        });
        this.coronar();
    }
}
export default Tablero;