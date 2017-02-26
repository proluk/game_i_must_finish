//virus module
const virus = [
	{
		'type' : 'RickRold',
		'duration' : 120000,
		'url' : 'https://www.youtube.com/embed/dQw4w9WgXcQ'
	},
	{
		'type' : 'HEYHEYHEYA',
		'duration' : 100000,
		'url' : 'https://www.youtube.com/embed/ZZ5LpwO-An4'
	},
	{
		'type' : 'Chum Drum',
		'duration' : 60000,
		'url' : 'https://www.youtube.com/embed/tVj0ZTS4WF4'
	},
	{
		'type' : "Look at my horse",
		'duration' : 100000,
		'url' : 'https://www.youtube.com/embed/fe4fyhzS3UM'
	},
	{
		'type' : "Nyan Cat",
		'duration' : 100000,
		'url' : 'https://www.youtube.com/embed/wZZ7oFKsKzY'
	},
	{
		'type' : "Gandalf Sax",
		'duration' : 100000,
		'url' : 'https://www.youtube.com/embed/Sagg08DrO5U'
	},
	{
		'type' : "Keybord Cat",
		'duration' : 60000,
		'url' : 'https://www.youtube.com/embed/O2ulyJuvU3Q'
	},
	{
		'type' : "My Heart Will Go On",
		'duration' : 120000,
		'url' : 'https://www.youtube.com/embed/X2WH8mHJnhM'
	}
];

function randomVirus(){
	let tmp = Math.floor( (Math.random() * virus.length ) + 0);
	return virus[tmp];
}


module.exports.randomVirus = randomVirus;