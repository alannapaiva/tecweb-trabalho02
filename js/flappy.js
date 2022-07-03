const Values = window.location.search;
const urlParams = new URLSearchParams(Values);

const nome = urlParams.get('nome');
const cenario = urlParams.get('turno');
const intervaloCanos = urlParams.get('intervalo');
const distanciaCanos = urlParams.get('distancia');
const velocidadeJogo = urlParams.get('velocidade');
const personagem = urlParams.get('personagem');
const tipos = urlParams.get('tipo');
const velocidadePers = urlParams.get('velocidade-perso')
const pontuacao = urlParams.get('pontuacao');

function novoElemento(tagName, className) {
    const elemento = document.createElement(tagName)
    elemento.className = className
    return elemento
}


function Barreira(reversa = false) {
    this.elemento = novoElemento('div', 'barreira')
    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`

}

function ParDeBarreiras(altura, abertura, popsicaoNaTela) {
    this.elemento = novoElemento('div', 'par-de-barreiras')
    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)


    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        console.log('superior: ', alturaSuperior)
        console.log('inferior: ', alturaInferior)
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }
    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX =  popsicaoNaTela => this.elemento.style.left = `${popsicaoNaTela}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(popsicaoNaTela)
} 

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    abertura = parseInt(intervaloCanos)
    espaco = parseInt(distanciaCanos)
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3 
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }
            const meio = largura / 2
            const cruzouMeio = par.getX() + deslocamento >= meio
                && par.getX() < meio
            if (cruzouMeio) {
                notificarPonto()
            }
        })
    }
}

function Passaro(alturaJogo) {
    let voando = false

    if(personagem === 'ViuvaNegra'){
        this.elemento = novoElemento('img', 'passaro')
        this.elemento.src = 'img/viuva.png'
    }else if(personagem === 'Hulk'){
        this.elemento = novoElemento('img', 'passaro')
        this.elemento.src = 'img/hulk.png'
    }else if(personagem === 'Passaro'){
        this.elemento = novoElemento('img', 'passaro')
        this.elemento.src = 'img/passaro.png'
    }

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? parseInt(velocidadePers) : -5)
        const alturaMaxima = alturaJogo - this.elemento.clientWidth

        if (novoY <= 0) {
            this.setY(0)
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY)
        }
    }
    this.setY(alturaJogo / 2)
}

 function Progresso() {

    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

 function estaoSobrepostos(elementoA, elementoB) {

    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()
    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top

    return horizontal && vertical
}


 function FlappyBird() {
    let pontos = 0
    const areaDoJogo = document.querySelector('[wm-flappy]')
    if(cenario === 'diurno'){
        areaDoJogo.style.backgroundImage = "url('./img/diurno.jpg')";
    }else{
        areaDoJogo.style.backgroundImage = "url('./img/noturno.png')";
    }
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth
    const abertura = parseInt(intervaloCanos)
    const espaco = parseInt(distanciaCanos)

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, abertura, espaco,
        () => progresso.atualizarPontos(pontos += parseInt(pontuacao)))

        function colidiu(passaro, barreiras) {
            let colidiu = false
        
            if(tipos === 'real'){
                barreiras.pares.forEach(parDeBarreiras => {
                    if (!colidiu) {
                        const superior = parDeBarreiras.superior.elemento
                        const inferior = parDeBarreiras.inferior.elemento
                        colidiu = estaoSobrepostos(passaro.elemento, superior)
                            || estaoSobrepostos(passaro.elemento, inferior)
                    }else{
                        const gameOver = document.querySelector('[game-over]')
                        const infos = document.querySelector('[infos]')
                        gameOver.style.display = 'flex'
                        let somorte = document.querySelector('[som]')
                        somorte.play()
                        infos.innerText = `${nome} ganhou ${pontos} pontos`
                    }
                })
            }else{
                barreiras.pares.forEach(parDeBarreiras => {
                    if (colidiu) {
                        const superior = parDeBarreiras.superior.elemento
                        const inferior = parDeBarreiras.inferior.elemento
                        colidiu = estaoSobrepostos(passaro.elemento, superior)
                            || estaoSobrepostos(passaro.elemento, inferior)
                    }
                })
            }
            return colidiu
        
        };
    const passaro = new Passaro(altura)

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

              if(colidiu(passaro,barreiras)){
                 clearInterval(temporizador) 
             } 
        }, velocidadeJogo)
    }
}
 new FlappyBird().start() 