/*
Simple Sanitizer Lib
*/
var Sanitizer = (function() {
    // Remove extra spaces between words
    var removeExtraSpaces = function(text) {
        var wordsArr = text.split(' ');
        return _.filter(wordsArr, function(word) {
            return word !== '';
        }).join(' ');
    };
    // Truncate word with the specified length
    var truncateWord = function(text, maxLength) {
        var wordsArr = text.split(' ');
        return _.map(wordsArr, function(word) {
            if(word.length > maxLength) {
                return word.substring(0, maxLength);
            }
            return word;
        }).join(' ');
    };

    return {
        removeExtraSpaces: removeExtraSpaces,
        truncateWord: truncateWord
    }
})();
