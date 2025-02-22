window.addEventListener('load', function(){
	window.cookieconsent.initialise({
		revokeBtn: "<div class='cc-revoke'></div>",
		type: "opt-in",
		theme: "classic",
		palette: {
			popup: {
				background: "#000",
				text: "#fff"
			},
		 	button: {
				background: "#fd0",
				text: "#000"
			}
		},
		content: {
			message: "This site uses Google Analytics 4 cookies only to distinguish unique visitors.",
			link: "Cookie details",
			href: "https://support.google.com/analytics/answer/11397207?hl=en"
		},
		onInitialise: function(status) {if(status == cookieconsent.status.allow) myScripts();},
		onStatusChange: function(status) {if(this.hasConsented()) myScripts();}
	})
});

function myScripts() {
window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-5CR6XYZPYE');
}