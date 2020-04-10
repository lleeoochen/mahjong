var user = null;
var auth_user = null;
var database = new Firebase();

database.authenticate((_auth_user) => {
	initToolbar();
	auth_user = _auth_user;
	database.getUser(_auth_user.uid).then((user_data) => {
		user = user_data;
		showMatches();
	});
});

function showMatches() {
	if (!user || !user.matches) return

	database.getMatches(user.matches, user, async (matches_data) => {
		var elements = $();
		matches_data.sort((a, b) => b[1].updated.toDate().getTime() - a[1].updated.toDate().getTime());
		await matches_data.forEach(match => {
			let match_name = match[0];
			let match_data = match[1];
			let d = match_data.updated.toDate();
			let d_str = Util.formatDate(d);

			elements = elements.add(`
				<a class="btn btn-warning match-link" href="${ WEB_URL }/game.html?match=${ match_name }">
					<div style="display: flex; align-items: center;">
						<div>
							<img src="assets/mahjong.png"/>
						</div>
						<div style="text-align: left;">
							麻將表格<br/>
							<div class="match-link-date"> ${ d_str } </div>
						</div>
						<div class="match-link-turns">
							${ match_data.turns.length }局
						</div>
						<img class="match-link-delete hidden" src="assets/close.png"/>
					</div>
				</a>`
			);
		});

		$('#matches-list').empty();
		$('#matches-list').append(elements);
	});

}

function initToolbar() {
	// Signout button
	$('#signout-btn').on('click', (e) => {
		firebase.auth().signOut();
		location.reload();
	});

	// New match button
	$('#new-match-btn').on('click', (e) => {
		database.createMatch(user, match_id => {
			window.location = `${ WEB_URL }/game.html?match=${ match_id }`;
		});
	});

	$('#chess-toolbar').removeAttr('hidden');
}
