//communicates
//before login
let website = "https://networkconquer.com";
let global_commands = [
	"clear - clears your log.",
	/*"info <i>virus</i> - gets the type of Virus.",*/
	"unpack -s <i>package</i> <i>pin</i> <i>method</i> - starts unpacking process.",
	"unpack -a <i>package</i> <i>pin</i> - aborts unpacking process",
	"kill -s <i>address</i> <i>pin</i> <i>method</i> - Starting kill process",
	"kill -a <i>address</i> <i>pin</i> - Abort killing process",
	"decrypt <i>method</i> <i>cipher</i> - decrypts cipher with provided method.",
	"me - shows your address."
];
let help_commands = {
	before : [
		"register - create new account.",
		"login - log in...",
		"more - visit website for more help. "+website,
	],
	//after login
	home : [
		"connect -d <i>address</i> - direct connect to user.",
		"connect -f <i>address</i> - preform botnet attack to Gate of provided address.",
		"disconnect - disconnects from user.",
		"open -w <i>url</i> - open website from provided url.",
		"open -t <i>url</i> - open TOR onion website.",
		"close - closes current website.",
		"rule -s - shows set rules.",
		"rule -a <i>nick</i> - add new connection rule.",
		"rule -r <i>nick</i> - remove connection rule.",
		"ssh account - connects to account of current connection.",	
		"system - shows information about account."
	],
	openw : [
		"listen - listen website traffic to find other users.",
		"mine - mine bitcoins.",
		"stop -l - stops listen.",
		"stop -m - stops mining.",
		"close - closes current website."
	],
	opent : [
		"buy -b <i>quantity</i> - buys artificial connections to your Botnet.",
		"buy -g <i>quantity</i> - buys gate ability to process more connections.",
		"buy -s <i>nick</i> - Search for user current address for a small fee.",
		"close - closes current website."
	],
	bank : [
		"balance - check balance of connected account.",
		"transfer -s <i>address</i> <i>howmuch</i> - Start transfering money to specific address.",
		"transfer -a - Aborts transfer process.",
		"transfer -sg <i>address</i> <i>howmuch</i> - Sends Gate points to someone",
		"transfer -sb <i>address</i> <i>howmuch</i> - Sends Botnet points to someone",
		"logs - shows transaction log.",
		"exit - exit account connection.",
		"options -p - set 3 digit pin code to enter account."
	]
};
function help(data){
	let response = '';
	if ( data == 'global' ) {
		response += "</br>-------------- GLOBAL COMMANDS ----------------</br>";
		for ( let i = 0 ; i < global_commands.length ; i ++ ) {
			response += "</br>"+global_commands[i]+"</br>";
		}
	} else {
		response = '</br>-------------------- HELP ---------------------</br>';
		for ( let i = 0 ; i < help_commands[data].length ; i ++ ) {
			response += "</br>"+help_commands[data][i]+"</br>";
		}		
	}

	response += "</br>-----------------------------------------------</br></br>";
	return response;
}

const communicates = {
	begin : "Hello. New here? write <i>help</i> to see all avaiable commands.",
	tip_01 : "",
	tip_02 : "",
	no_command : "No such command: ",
	no_such_connection : "Could not find given connection.",
	connected : "Connected to: ",
	disconnect : "You have been disconnected. ",
	already_connected : "You are already connected somewhere.",
	no_connection : "No connection to close.",
	open : "Open success, connected to: ",
	no_website : "Cannot connect. No such website: ",
	closed : "Connection Closed.",	
	user_connected : "Unknown user has established a connection with you.",
	close_site_first : "Close connection to site first.",
	disconnect_user_first : "Disconnect from user first.",
	user_left : "Uknown user has left.",
	account : "Connection to account established.",
	account_close : "Connection to account closed.",
	account_error : "No established connection to account.",
	account_balance : "Your account balance: ",
	account_close_first : "Exit ssh connection first",
	no_sudo : "No need to use sudo.",
	account_activated : "You are one of us now. Log in.",
	login_started : "Login process started. Type your login.",
	login_already_exists : "This Login is already in database.",
	login_not_found : "There is no such login in database",
	login_password : "Type in password.",
	rules_breaking : "Follow the rules. Do not play with us.",
	email_exists : "This Email is already in database.",
	nick_exists : "This Nick is already in database.",
	login_success : "You are in. Type <i>help</i> everytime you want to see available commands.</br>Type <i>help -g</i> to see global commands.",
	login_failed : "Login Failed. Try Again ",
	register_started : "Register process started. Follow further instructions.</br> Type your future unique login.",
	register_password : "Write your password.",
	register_email : "Write your unique email.",
	register_nick : "Write your unique nick. Your nick will be visible for other users.</br>For security reasons, make it different from your login.",
	register_success : "Register process finished. You can enter the game now. Type <i>login</i> and follow instructions.",
	found_hash : "Success! Found hash. Use it to connect : ",
	listen_process_begin : "Listening website traffic...",
	no_listen_process : "No listening process found.",
	unexpected_error : "Unexpected error occured. Refresh Page.",
	transaction_success : "Transaction finished.",
	transaction_stopped : "Transaction process Aborted.",
	no_transaction_runnnig : "No transaction process is running. Cannot abort.",
	transaction_running : "There is already transaction process running.",
	not_enough_money : "Not enough funds to finish transaction.",
	provide_url : "Please do not use www. Use http:// or https://",
	room_empty : "Looks like you are alone. Try different website.",
	already_listening : "Listening process already running.",
	listen_stopped : "Listening process stopped.",
	not_mine : "Servers of this website, are not prepared for mining bitcoins.",
	connect_mine_first : "Connect to the website with servers prepared for mining bitcoins first.",
	mine_start : "Mining bitcoins process started...",
	no_mine_process : "No mining process is running.",
	mine_stop : "Mining bitcoins process stopped.",
	wrong_command_use : "Command syntax error. Please check help.",
	wrong_pin : "Pin Code is incorrect.",
	enter_pin : "Please enter pin code.",
	enter_new_pin : "Please enter 3 digits long pin code.",
	set_wrong_pin : "Pin code you provided is wrong. Please use only digits.",
	set_pin_success : "New pin code set.",
	connection_stage_one_try : "Connection process starting. Checking connection...",
	connection_stage_one_success : "Connection exists.",
	connection_stage_two_try : "Handshake to Gate process starting... Sending SYN",
	connection_handshake_failed  : "Hanshake to Gate failed.",
	connection_remove_gate_points : "Gate Response : Unauthorized connection.",
	connection_stage_two_success : "SYN-ACK Recived",
	connection_pre_established : "Sending ACK.",
	connection_established : "Connection Established.",
	gate_status : "Gate status : ",
	preparing_botnet : "Preparing Botnet...",
	botnet_ready : "Preparing Botnet finished.",
	botnet_attack_start : "Botnet connection process begin...",
	botnet_attack_finished : "Botnet connection process finished.",
	botnet_points_removed : "The number of artificial connections of your Botnet has decrased by: ",
	tor_connection : "You have connected to a TOR website.",
	connect_to_tor_website_first : "You have to connect to a specific website first.",
	add_auth_connection : "New rule established for connecting to your account.",
	remove_auth_connection : "Rule removed.",
	decrypted_hash : "Hash decryption success.",
	no_nick : "No such nick in database.",
	no_decryption_support : "Decryption method you provided is not supported.",
	decrypt_error : "Decrypt Error! check used method or cipher.",
	user_already_infected : "User is already infected.",
	virus_error : "There is no such virus or is already in use.",
	virus_block_success : "Aborting unpack success.",
	virus_block_help : "Unpacking process begin. If you do not recal such activity, Abort This Process Immediately!",
	virus_unpack_info : "Unpacking process will end in 45sec.",
	cannot_listen_on_tor : "Tor websites are immune to listening traffic. Cannot listen here.",
	rule_error_wrong_place : "Exit account connection or close site you are currently visiting.",
	killing_abort : "Killing process Aborted.",
	killing_success : "Process Killed.",
	killing_running : "Killing process is already running.",
	killing_process_not_found : "There is no such killing process.",
	no_botnet : "You have no artificial connections. Cannot use Botnet attack.",
	searching_user : "Tracking user address...",
	user_offline : "User is currently offline.",
	user_already_online : "This user is already Connected",
	daily_enter : "You have connected to a daily website. To aquire Daily reward write: mine <i>pin</i>.",
	daily_success : "Success! Daily finished.",
	cannot_connect_yourself : "You cannot connect to yourself",
	cannot_kill_yourself : "You cannot kill process of you."

}


module.exports.help = help;
module.exports.communicates = communicates;