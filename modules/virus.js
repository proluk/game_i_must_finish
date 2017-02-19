//virus module
const virus = [
	{
		'type' : 'RickRold',
		'duration' : 60000,
		'url' : 'https://www.youtube.com/embed/dQw4w9WgXcQ'
	}
];

function randomVirus(){
	let tmp = Math.floor( (Math.random() * 100 ) + 0);
	if ( tmp < 100 ) {
		return virus[0];
	} 
}


module.exports.randomVirus = randomVirus;