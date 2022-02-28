module.exports = {
    errorResponse: (code, detail)=>{
        console.log(detail);
        const message = "Your request could not be processed. Please try again."
        return {
            success:false,
            error:true,
            code,
            message,
            detail,
        }
    }
}