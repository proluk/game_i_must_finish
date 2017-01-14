//communicates

let connect_help = 'connect user  -  try to connect to provided user.</br>';
let disconnect_help = 'disconnect user  -  disconnects provided user.</br>';
let open_help = 'open url  -  opens website. Write  close  to close.</br>';
let more_help = 'Need more help? Write  morehelp';

let help_before = '</br>register  -  starts a register process. You will have to provide unique login, password and unique email.</br></br>login  -  starts a login process. Provide your login and password in further steps.</br></br>'+more_help;
let help_after = "</br>"+connect_help+"</br>"+disconnect_help+"</br>"+open_help+"</br>"+more_help+"</br>";




const communicates = {
	begin : "Hello</br>register - to create new account</br>login - to use existing one.</br>Need help? Write: help",
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
	no_sudo : "No need to use sudo.",
	account_activated : "You are one of us now. Log in.",
	login_started : "Login process started. Type your login.",
	login_already_exists : "This Login is already in database.",
	login_not_found : "There is no such login in database",
	login_password : "Type in password.",
	rules_breaking : "Follow the rules. Do not play with us.",
	email_exists : "This Email is already in database.",
	login_success : "You are in.",
	login_failed : "Login Failed. Try Again ",
	register_started : "Register process started. Type your future login.",
	register_password : "Type your password.",
	register_email : "Type your email.",
	register_success : "Register process finished. You can login now.",
	help_before : help_before,
	help_after : help_after,
	found_hash : "Success! Found hash. Use it to connect : ",
	no_listen_process : "No listening process found.",
	unexpected_error : "Unexpected error occured. Refresh Page."
}



module.exports = communicates;