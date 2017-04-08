let daily_list = [
    'The secret of getting ahead is getting started.',
    'To live a creative life, we must lose our fear of being wrong.',
    'If you are not willing to risk the usual you will have to settle for the ordinary.'
];
function makeDaily(numo) {
    let num = numo+1;
    let daily_address = '';
    if ( num >= daily_list.length ) {
        num = 0;
    } 
    let daily = {
        quote : daily_list[num],
        address : convertQuoteToUrl(num),
        number : num
    };
    return daily;
}
function convertQuoteToUrl(num){
    let str = "";
    let arr = daily_list[num].split(" ");
    for ( let i = 0 ; i < arr.length ; i ++ ) {
        str += arr[i][0];
    }
    let url = "http://"+str.toLowerCase()+".onion";
    return url;
}

module.exports.makeDaily = makeDaily;