import Tablero from 'src/classes/Tablero.js';
import {GANAN_BLANCAS, GANAN_NEGRAS, JUEGO_INCONCLUSO} from '../helpers/constants';
class MinimaxPodaAlfaBeta {
    tableroActual = null;
    alfa = -100000; 
    beta = 100000;
    profundidadMax = 1; //cantidad de niveles del árbol que como máximo bajará
    jugador = 1; //asumo que jugador es blancas (2)
    rival = 2; //asumo que es negras (1) el rival
    //movimientoElegido = {};

    constructor( jugador = 1, N, tablero ){
        this.jugador = jugador;
        this.rival = (this.jugador % 2) + 1;
        this.tableroActual = tablero;
        this.profundidadMax = N || 1;
    }
    jugar( ){
        console.log('Tablero',this.tableroActual);
        if (this.tableroActual.getAllJugadas(this.rival).length === 0) { //si el rival ya no tiene movimientos posibles pierde
            console.log("el rival ha perdido");
        } else if(this.tableroActual.getAllJugadas(this.jugador).length === 0){ //si el jugador ya no tiene movimientos posibles pierde
            console.log("minimax con poda ha perdido");
        }else{

            // console.log('cant mov rival '+this.tableroActual.getAllJugadas(this.rival));
            // console.log('cant mov minim '+this.tableroActual.getAllJugadas(this.jugador));

            //this.movimientoElegido = {}; //hacemos vacío el movimiento elegido
            let movimientoElegido = this.decisionMinimaxAlfaBeta(this.tableroActual,this.profundidadMax);
            let {movimiento, puedeCapturar, fichasCapturadas, ficha} = movimientoElegido; //desarmamos el movimiento
            let [movFila, movColumna] = movimiento; //ver valores del movimiento
            console.log('mov elegido: ['+movFila+']['+movColumna+']');

            this.tableroActual.jugar(movimientoElegido); //jugamos con el movimiento elegido que fue cargado en maxValue
        }
    }
    jugarVsRandom(){
        let index = 0;
        while (this.tableroActual.calcularResultado() === JUEGO_INCONCLUSO && index <100) { //limitamos a 200 turnos máximo
            index++;
            if (this.tableroActual.getAllJugadas(this.rival).length === 0) { //si el rival ya no tiene movimientos posibles pierde
                console.log("el rival ha perdido");
                break;
            } else if(this.tableroActual.getAllJugadas(this.jugador).length === 0){ //si el jugador ya no tiene movimientos posibles pierde
                console.log("minimax con poda ha perdido");
                break;
            }else{
                this.tableroActual.dibujarTablero();

                // console.log('cant mov rival '+this.tableroActual.getAllJugadas(this.rival));
                // console.log('cant mov minim '+this.tableroActual.getAllJugadas(this.jugador));

                //movimiento del rival
                console.log(index+") cantidad de fichas: "+this.tableroActual.cantFichasBlancas+" blancas y "+this.tableroActual.cantFichasNegras+" negras"); //mostramos al rival sus jugadas disponibles
                console.log("se elegira una jugada random entre las disponibles ");
                this.tableroActual.jugarRandom(this.rival);
                console.log('movimiento de rival');
                this.tableroActual.dibujarTablero();
                //movimiento del minimax
                // this.movimientoElegido = {}; //hacemos vacío el movimiento elegido
                // console.log("print minimax: "+this.maxValue(this.tableroActual,this.profundidadMax,this.alfa,this.beta));
                //console.log("juego: "+this.tableroActual.calcularResultado());
                
                let movimientoElegido = this.decisionMinimaxAlfaBeta(this.tableroActual,this.profundidadMax);
                let {movimiento, puedeCapturar, fichasCapturadas, ficha} = movimientoElegido; //desarmamos el movimiento
                let [movFila, movColumna] = movimiento; //ver valores del movimiento
                console.log('mov elegido: ['+movFila+']['+movColumna+']');
                this.tableroActual.jugar(movimientoElegido); //jugamos con el movimiento elegido que fue cargado en maxValue
            }
        }
        this.tableroActual.dibujarTablero();
    }

    decisionMinimaxAlfaBeta(tableroActual,profundidadMax){ //función que llama a las funciones minimax y elige el siguiente movimiento
        //let tableroSimulado = new Tablero();
        //primero obtenemos el mejor reward
        let rewardMax = this.alfa;
        rewardMax = this.maxValue(tableroActual,profundidadMax,this.alfa,this.beta);
        console.log(rewardMax);
        //luego vemos todos los posibles movimientos para el tablero actual
        let listaMejoresMovimientos = [];  
        let listaMovimientosCaptura = []; 
        let mejorMovElegido = null;
        let mejorMovCaptura = null;
        for (const movimiento of tableroActual.getAllJugadas(this.jugador)) {
            const tableroSimulado = new Tablero(tableroActual.clonarTablero());
            // tableroSimulado.table = tableroActual.clonarTablero();
            tableroSimulado.jugar(movimiento);
            //console.log('cant mov minim '+this.tableroActual.getAllJugadas(this.jugador).length);
            let rewardMovimiento = this.minValue(tableroSimulado,profundidadMax-1,this.alfa,this.beta); //simulamos la jugada para obtener el reward a partir de cada mov
            console.log('rewards posibles; '+rewardMovimiento);
            if (rewardMovimiento === rewardMax) { //si el reward del movimiento es igual al reward máximo cargamos en la lista de mejores movimientos
            // if (movimiento.reward === rewardMax) { seria bueno implementar así
                mejorMovElegido = movimiento;
                listaMejoresMovimientos.push(movimiento);
                if (movimiento.puedeCapturar === true) { //verificamos además si hay movimientos de captura
                    listaMovimientosCaptura.push(movimiento);
                    mejorMovCaptura = mejorMovElegido;
                }
            }
        }
        //luego entre los mejores movimientos con el mismo reward elegimos uno al azar.  
        let elegidoIndex = -1;
        if (listaMejoresMovimientos.length > 1) { //si hay varios elementos en la lista elegir uno al azar
            if (listaMovimientosCaptura.length > 1) {    //si hay más de un elemento de captura, elegimos al azar entre ellos
                elegidoIndex = Math.floor(Math.random() * (listaMovimientosCaptura.length - 1));
                mejorMovElegido = listaMovimientosCaptura[elegidoIndex];
                console.log('existen varias opciones de captura');
            }else if(listaMovimientosCaptura.length === 1){ //si hay solo un movimiento de captura, elegimos ese
                mejorMovElegido = mejorMovCaptura;
                console.log('existe una opción de captura');
            }else{ //si no hay movimientos de captura elegir entre todos al azar
                elegidoIndex = Math.floor(Math.random() * (listaMejoresMovimientos.length - 1));
                mejorMovElegido = listaMejoresMovimientos[elegidoIndex];
                console.log('no existen opciones de captura');
            }
        }      
        console.log(JSON.stringify(mejorMovElegido));
        return mejorMovElegido;
    }

    //funciones minimax
    maxValue(tableroActual,profundidadMax,alfa,beta){ //función max de minimax
        // let tableroSimulado = new Tablero();
        let max = this.alfa;
        //tablero que simulará la jugada y la pasará al siguiente elemento
        if (profundidadMax <=0 || tableroActual.calcularResultado() !== JUEGO_INCONCLUSO){
            //cutOff Test: Si ya se llegó al valor de corte o si la partida ya termina
            return this.rewardJugada(tableroActual);
        }
        //let movElegido = [];
        for (let movimiento of tableroActual.getAllJugadas(this.jugador)) {
            
            const tableroSimulado = new Tablero(tableroActual.clonarTablero()); 
            // tableroSimulado.table = tableroActual.clonarTablero();
            //Jugamos cada movimiento y lo pasamos como parámetro al siguiente nivel del arbol
            tableroSimulado.jugar(movimiento);
            let posibleMov = this.minValue(tableroSimulado,profundidadMax-1,alfa,beta);
            if(posibleMov > max){
                max = posibleMov;
            }
            if (max >= beta) { //poda
                // console.log('['+this.jugador+']profundidad: '+(4-profundidadMax)+' podado');
                //return beta;
                break;
            }
            if ( max >= alfa ) {
                alfa = max;
                //movElegido = movimiento; //cargamos el movimiento en la variable global
                //hacemos lo de movElegido solo en alfa porque alfa son las jugadas de nuestro algoritmo y beta del rival
            }
            
            //this.movimientoElegido = movElegido;
        }
        //console.log('['+this.jugador+']profundidad: '+(4-profundidadMax)+' valor(alfa):'+ alfa);
        return alfa;
    }


    minValue(tableroActual,profundidadMax,alfa,beta){ //función min de minimax
        // let tableroSimulado = new Tablero();
        let min = this.beta;
        if (profundidadMax <=0  || tableroActual.calcularResultado() !== JUEGO_INCONCLUSO){ //cutOff Test
            //console.log('entra aqui (min):'+ tableroActual.calcularResultado());
            return this.rewardJugada(tableroActual);
        }
        for (let movimiento of tableroActual.getAllJugadas(this.rival)) {  
            
            const tableroSimulado = new Tablero(tableroActual.clonarTablero());
            // tableroSimulado.table = tableroActual.clonarTablero();
            tableroSimulado.jugar(movimiento);
            let posibleMov = this.maxValue(tableroSimulado,profundidadMax-1,alfa,beta);
            if(posibleMov < min){
                min = posibleMov;
            }
            if (alfa >= min) { //poda
                //console.log('['+this.jugador+']profundidad: '+(4-profundidadMax)+' podado');
                //return alfa;
                break;
            }
            if (min < beta) {
                beta = min;
            }
        }
        //console.log('['+this.jugador+']profundidad: '+(4-profundidadMax)+' valor(beta):'+ beta);
        return beta;
    }

    
    rewardJugada(tableroActual){ //función de reward de cada jugada que llega a las hojas del árbol
        let reward = 0;
        if (tableroActual.calcularResultado() === GANAN_BLANCAS) { //si ganan las blancas
            if (this.jugador === 2) { //si el jugador es blancas entonces gana
                reward = 20202;
            } else { //pierde
                reward = -20202;
            }
        } else if(tableroActual.calcularResultado() === GANAN_NEGRAS) { //si ganan las negras
            if (this.jugador === 1) { //si el jugador es negras entonces gana
                reward = 20202;
            } else { //pierde
                reward = -20202;
            } 
        } else{ //si la partida aún no termina
            if (this.jugador === 2) { //si el jugador es blanco
                reward = this.rewardPiezasBlancas(tableroActual); //cantidad de blancas

            } else { //si el jugador es negro
                reward = this.rewardPiezasNegras(tableroActual); //cantidad de negras
            }
            // var rewardPosJugador = 0;
            // for (let posicion of tableroActual.getFichas(this.jugador)) { //calcular recompensa de cada posición
            //     rewardPosJugador += this.rewardPosicion(posicion);
            // }
            // var rewardPosRival = 0;
            // for (let posicion of tableroActual.getFichas(this.rival)) { //restamos la recompensa de cada posición del rival
            //     rewardPosRival+= this.rewardPosicion(posicion);
            // }
            // //sacamos un promedio de puntajes de las posiciones y las restamos entre sí
            // if (this.jugador == 2) { //si el jugador es blancas
            //     reward += (rewardPosJugador/tableroActual.cantFichasBlancas)-(rewardPosRival/tableroActual.cantFichasNegras);
            // }else{ //si el jugador es negras
            //     reward += (rewardPosJugador/tableroActual.cantFichasNegras)-(rewardPosRival/tableroActual.cantFichasBlancas);
            // }
            //reward += this.rewardPosBordes() +this.rewardCubrirAliado() +this.soplo();
        }
        return reward;
    }

    //subrutinas reward
        //asignaremos el mismo valor a comer que a coronar
    rewardPiezasBlancas(tableroActual){
        return 100*(tableroActual.cantPeonesBlancos - tableroActual.cantPeonesNegros) +
        10*(tableroActual.cantDamasBlancas-tableroActual.cantDamasNegras);
    }

    rewardPiezasNegras(tableroActual){
        return 100*(tableroActual.cantPeonesNegros - tableroActual.cantPeonesBlancos) +
        10*(tableroActual.cantDamasNegras-tableroActual.cantDamasBlancas);
    }
    
    // rewardPosicion(x , y) {
    //     if (x == 0 || x == 7 || y == 0 || y == 7){
    //         return 5;
    //     }
    //     else {
    //         return 3;
    //     }
    // }

    //funciones extra
    max(a,b){
        if (a>=b) {
            return a;
        } else {
            return b;
        }
    }

    min(a,b){
        if (a<=b) {
            return a;
        } else {
            return b;
        }
    }

}
export default MinimaxPodaAlfaBeta;