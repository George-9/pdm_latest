class DebugUtils {
    if(condition) {

    }

    static Env() { return require('process').env }
    static PRINT(...data) {
        if (DebugUtils.Env().debug && DebugUtils.Env().debug === 'true') {
            console.log(...data);
        }
    }
}

module.exports = { DebugUtils }