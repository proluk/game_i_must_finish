function makeBinary(number, fake, order_bin_size, number_bin_size) {
    let num = number.toString(); 
    let num_and_fake = num;
    for ( let i = 0 ; i < fake ; i ++ ) {
        num_and_fake += Math.round(Math.random() * (10 - 0) + 0);
    }
    //make array
    let arr = [];
    for ( let i = 0 ; i < num.length+fake ; i ++ ) {
        arr[i] = {
            'key' : i,
            'val' : num_and_fake[i]
        }
    }
    //shuffle array
    arr = shuffle(arr);
    //make order
    try {
        let order = makeOrder(arr, 4);
        let result = makeBinaryOrder(order, order_bin_size)+makeBinaryNumber(arr, num_and_fake.length, number_bin_size);
        return result;
    } catch(e) {
        console.log(e);
    }

}
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}
function makeOrder(arr, length){
    let order = [];
    for ( let i = 0 ; i < 3 ; i ++ ) {
        for ( let m = 0 ; m < length ; m ++ ) {
            if ( arr[m]['key'] == i ) {
                order[i] = m;        
            }        
        }
    }
    return order;
}
function makeBinaryOrder(order, bin_size){
    let bin = '';
    for ( let i = 0 ; i < 3 ; i ++ ) {
        let tmp = parseInt(order[i], 10).toString(2);
        bin += pad(tmp, bin_size);
    }
    return bin;
}
function makeBinaryNumber(arr, length, bin_size){
    let bin_pin = '';
    for ( let i = 0 ; i < length ; i ++ ) {
        let tmp = parseInt(arr[i]['val'], 10).toString(2);
        bin_pin += pad(tmp,bin_size);
    }
    return bin_pin;  
}
function pad(s, size) {    
    while (s.length < size) s = "0" + s;
    return s;
}

module.exports.makeBinary = makeBinary;