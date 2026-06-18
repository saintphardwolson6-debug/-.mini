# Bot WhatsApp Premium — scaffold

Ceci est un scaffold initial pour le "BOT WHATSAPP PREMIUM" conforme à la spécification fournie.

Principales caractéristiques:
- Session locale via useMultiFileAuthState (dossier auth_info/)
- Pas de MongoDB ni base externe
- Commandes modulaires dans le dossier commands/
- Envoi d'une notification au propriétaire avec public/bot.png si présent
- Auto-join (tentative) et auto-follow (placeholder) exécutés une seule fois par session
- Auto-react (meilleure effort) activé
- Serveur Express avec routes / et /pair

Installation rapide:
1. Copier `.env.example` en `.env` et remplir les valeurs nécessaires
2. Placer `public/bot.png` (image du bot) dans le dossier public/
3. npm install
4. npm start

Notes:
- Certaines fonctions (acceptation d'invite de groupe, follow channel, réactions) dépendent de la version de Baileys et peuvent nécessiter des ajustements.
- Le bot respecte la règle: il ne répond qu'aux messages commençant par le préfixe configuré.
