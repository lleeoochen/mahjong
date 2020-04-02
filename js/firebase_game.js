class GameFirebase extends Firebase {
	// match = null;
	// match_id = null;
	// my_team = null;

	listenMatch(match_id, callback) {
		this.match = null;
		this.match_id = match_id;

		var self = this;
		super.listenMatch(match_id, (match) => {
			self.match = match;
			callback(self.match);
		});
	}

	addTurn(values) {
		this.match.turns.push(Util.pack(values));
		this.db.collection(MATCHES_TABLE).doc(this.match_id).set({
			turns: this.match.turns,
			updated: new Date(),
		}, { merge: true });
	}

	removeTurn(index) {
		this.match.turns.splice(index, 1);
		this.db.collection(MATCHES_TABLE).doc(this.match_id).set({
			turns: this.match.turns,
			updated: new Date(),
		}, { merge: true });	
	}
}
