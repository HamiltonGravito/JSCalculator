class CalcController {
    
    constructor(){
        //this._atributo faz referência a um atributo privado
        this._displayCalcEl = document.querySelector('#display');
        this._dateEl = document.querySelector('#data');
        this._timeEl = document.querySelector('#hora');
        this._currentDate;
        this._locale = "pt-BR";
        this._operation = [];
        this._lastOperator = "";
        this._lastNumber = "";
        this._audioOnOff = false;
        this._audio = new Audio('click.mp3');
        this.initialize();
        this.initButtonsEvents();
        this.initKeyBoard();
    }

    //Copiar para área de transferência
    copyToClipboard(){

        //Cria um elemento input dinamicamente no documento
        let input = document.createElement('input');
        //Atribui ao input o valor que esta no display
        input.value = this.displayCalc;
        //Insere no body do documento
        document.body.appendChild(input);
        //Seleciona o elemento
        input.select();
        //Copia do browser para área de transferência do SO
        document.execCommand("Copy");
        //Remove o elemento da tela
        input.remove();
    }

    //Colar da área de transferencia
    pasteFromClipboard(){
        document.addEventListener('paste', e => {
            let text = e.clipboardData.getData('Text');
            this.displayCalc = parseFloat(text);
            
        });
    }

    initialize(){
        
        this.setDisplayDateTime();
        //Função que realiza uma atividade durante um determinado tempo
        setInterval(() => {
           this.setDisplayDateTime();
        }, 1000);
        this.setLastNumberToDisplay();
        this.pasteFromClipboard();

        //Cria um evento de duplo click no botão ac para ligar e desligar o audio
        document.querySelectorAll('.btn-ac').forEach(btn => {
            btn.addEventListener('dblclick', e =>{
                this.toggleAudio();
            });
        });
    }

    toggleAudio(){
        //O audio é true então nega é false então afirma
        this._audioOnOff = (this._audioOnOff) ? false : true;
    }

    playAudio(){
        if(this._audioOnOff) {
            this._audio.currentTime = 0;
            this._audio.play();
        }
    }

    //Eventos de teclado
    initKeyBoard(){

        document.addEventListener('keyup', e => {
            
            this.playAudio();

            switch(e.key){
                case 'Escape':
                    this.clearAll();
                break;
                case 'Backspace':
                    this.clearEntry();
                break;
                case '+':
                case '-':
                case '/':
                case '*':
                case '%':
                    this.addOperation(e.key);
                break;
                case 'Enter':
                case '=':
                    this.calc();
                break;
                case 'ponto':
                case '.':
                    this.addDot('.');
                break;
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key));
                break;
                //Caso o c tenha sido apertado junto com o ctrl
                case  'c':
                    if(e.ctrlKey) this.copyToClipboard();
                break;
            }
        });
    }

    //Metodo adiciona varios eventos a um elemento, os eventos são escritos com um espaço,
    //onde, o split quebra cada evento transformando em um vetor de eventos então para cada
    //evento o elemento recebe o evento e a função que é executada;
    addEventListenerAll(element, events, fn){
        events.split(" ").forEach(event => {
            element.addEventListener(event, fn, false);
        });
    }

    clearEntry(){
        this._operation.pop();
        this.setLastNumberToDisplay();
    }

    clearAll(){
        this._operation = [];
        this.lastNumber = "";
        this.lastOperation = "";

        this.setLastNumberToDisplay();
    }

    getLastOperation(){
        return this._operation[this._operation.length - 1];
    }

    setLastOperation(value){
        this._operation[this._operation.length - 1] = value;
    }

    //Se for um operador retornará true se não false
    isOperator(value){
       return (["+", "-", "%","*","/"].indexOf(value) > -1);
    }

    pushOperation(value){
        this._operation.push(value);

        if(this._operation.length > 3){
            this.calc();
        }
    }

    getResult(){
        //eval transforma uma variavel em String e realiza calculos caso a string possua operadores,
        //enquanto o join elimina os separadores de uma coleção 
        try{
            return eval(this._operation.join(""));
        }catch(e){
            setTimeout(() => {
                this.setError();
            }, 1);
        }
    }

    calc(){

        let last = "";
        this._lastOperator = this.getLastItem(true);
        if(this._operation.length < 3){
            let firstItem = this._operation[0];
            this._operation = [firstItem, this._lastOperator, this._lastNumber];
        }

        if(this._operation.length > 3){
            last = this._operation.pop();
            this._lastNumber = this.getResult();

        }else if(this._operation.length == 3){
            this._lastNumber = this.getLastItem(false);
        }

        let result = this.getResult();

        if(last == "%"){

          result /= 100;
          this._operation = [result];
        }else {
            this._operation = [result];
            if(last) this._operation.push(last);
        }
        this.setLastNumberToDisplay();
    }

    getLastItem(isOperator = true){

        let lastItem;
        for(let i = this._operation.length - 1; i >= 0; i-- ){
            if(this.isOperator(this._operation[i]) == isOperator){
                lastItem = this._operation[i];
                break;
            }
        }

        //Se não encontrar o ultimo item (undefined)
        if(!lastItem){
            //Caso seja um operador guarda lastOperator se não guarda lastNumber
            lastItem = (isOperator) ? this._lastOperator : this.lastNumber;
        }

        return lastItem;
    }

    setLastNumberToDisplay(){
        let lastNumber = this.getLastItem(false);

        if(!lastNumber) lastNumber = 0;
        this.displayCalc = lastNumber;
    }

    addOperation(value){
        //Não é um numero
        if(isNaN(this.getLastOperation())){

            //É um operador
            if(this.isOperator(value)){

                this.setLastOperation(value);

            }else {

                this.pushOperation(value);
                this.setLastNumberToDisplay();
            }
        //É um numero
        }else {

            if(this.isOperator(value)){

                this.pushOperation(value);

            }else {

            let newValue = this.getLastOperation().toString() + value.toString();
            this.setLastOperation(newValue);

            this.setLastNumberToDisplay();

            }
        }
    }

    setError(){
        this.displayCalc = "Error";
    }

    addDot(){

        let lastOperation = this.getLastOperation();

        if(typeof lastOperation === 'string' && lastOperation.split("").indexOf(".") > -1) return;

        //Se for um operador ou o primeiro valor (undefined)
        if(this.isOperator(lastOperation) || !lastOperation) {
            this.pushOperation("0.");
        }else {
            this.setLastOperation(lastOperation.toString() + ".");
        }

        this.setLastNumberToDisplay();
    }

    execBtn(value){

        this.playAudio();

        switch(value){
            case 'ac':
                this.clearAll();
            break;
            case 'ce':
                this.clearEntry();
            break;
            case 'soma':
                this.addOperation('+');
            break;
            case 'subtracao':
                this.addOperation('-');
            break;
            case 'divisao':
                this.addOperation('/');
            break;
            case 'multiplicacao':
                this.addOperation('*');
            break;
            case 'porcento':
                this.addOperation('%');
            break;
            case 'igual':
                this.calc();
            break;
            case 'ponto':
                this.addDot('.');
            break;
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
            break;

            default:
                this.setError();
            break;
        }
            
    }

    initButtonsEvents(){
        //Traz todos elementos que se enquadrem na condição da função (traz todos elementos filhos do id button e parts)
        let buttons = document.querySelectorAll('#buttons > g, #parts > g');

        //Para cada button(btn) adicione um ou mais eventos
        buttons.forEach((btn, index) => {
            this.addEventListenerAll(btn, "click drag", e => {
                let textBtn = btn.className.baseVal.replace("btn-", "");
                this.execBtn(textBtn);

            });

            this.addEventListenerAll(btn, "mouseover mouseup mousedown", e =>{
                btn.style.cursor = "pointer";
            });
        })
    }

    setDisplayDateTime(){
        this.displayDate = this.currentDate.toLocaleDateString(this._locale, {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
    }
   
    get displayTime(){
        return this._timeEl.innerHTML;
    }

    set displayTime(value){
        return this._timeEl.innerHTML = value;
    }
    
    get displayDate(){
        return this._dateEl.innerHTML;
    }

    set displayDate(value){
        return this._dateEl.innerHTML = value;
    }

    get displayCalc(){
        return this._displayCalcEl.innerHTML;
    }

    set displayCalc(value){

        //caso o valor do numero tiver mais que 10 digitos
        if(value.toString().length > 10){
            this.setError();
            //Sai do metodo caso aconteça o erro
            return false;
        }

        this._displayCalcEl.innerHTML = value;
    }

    get currentDate(){
        return new Date();
    }

    set currentDate(value){
        this._currentDate = value;
    }
}