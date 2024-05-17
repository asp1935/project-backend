// this code for if we get api error then error responce will be send in this format we can format error

class APIError extends Error{
    constructor(
        statusCode,
        message='Something went wrong',        //default msg
        errors=[],                             // pass multiple error
        statck=""                                //error stack
    ){
        super(message)
        this.statusCode=statusCode,
        this.data=null,
        this.message=message,
        this.success=false,               //msg goes but does not go success flag we are handling api errors not api responce
        this.errors=errors


        // for providing stack trace it gives info like in which file error occer

        if(statck){
            this.stack=statck
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {APIError}