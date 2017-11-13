/*
Simple validation lib
*/
var Validation = (function () {
    //Check is val in alpha numeric.
    var isAlphanumeric = function(val) {
        //^ matches beginning of input.
        //a-z - alphabet
        //\d - numeric [0-9]
        //\s - Matches white space character
        //+ - Repeat one or more
        //$ matches end of input
        //i - case in sensitive search
        return val.match(/^[a-z\d\s]+$/i);
    };

    //Check val is exceeding the max length
    var isValidLength = function(val, maxLength) {
        return (maxLength >= val.length);
    };

    return {
        isAlphanumeric: isAlphanumeric,
        isValidLength: isValidLength
    };
})();