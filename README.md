# Gavroche Admin Mobile

Application Next.js mobile installable pour l'administration du projet SeaFood.

## Fonctionnalites mobiles necessaires

Les fonctionnalites utiles sur mobile sont celles qui servent aux actions rapides de terrain:

- `Dashboard`: indicateurs rapides, commandes recentes, alertes stock.
- `Commandes`: consulter, rafraichir, changer le statut, supprimer si necessaire.
- `Produits`: creer, modifier, stock, prix, image Cloudinary, activation boutique.
- `Categories`: creer, modifier, activer/desactiver, gerer les produits rattaches.
- `Offres`: creer ou modifier une promotion liee a un produit.
- `Clients`: consulter les comptes, statut, role, suppression.
- `Connexion admin`: session securisee avec cookie HTTP-only.

La page `Securite` du back-office web reste surtout utile pour la configuration technique. Elle n'est pas prioritaire dans une application mobile quotidienne.

## Installation locale

```powershell
cd C:\Users\Lenovo\Desktop\ProjetE-Commerce\SeaFood\gavroche-admin-mobile
npm install
Copy-Item .env.local.example .env.local
npm run dev
```

Renseigner ensuite `.env.local` avec les memes valeurs que l'application admin web:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `ADMIN_SESSION_SECRET`

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run admin:hash -- "motdepassefort"`

## Mise en ligne gratuite avec un lien installable

Option simple: Vercel Hobby.

1. Creer un depot GitHub pour `gavroche-admin-mobile`.
2. Pousser le dossier `C:\Users\Lenovo\Desktop\ProjetE-Commerce\SeaFood\gavroche-admin-mobile`.
3. Aller sur Vercel, importer le depot, choisir le framework `Next.js`.
4. Ajouter les variables d'environnement dans `Project Settings > Environment Variables`.
5. Lancer le deploy.
6. Ouvrir l'URL HTTPS donnee par Vercel sur le telephone.
7. Sur Android Chrome: utiliser `Installer l'application` ou l'icone d'installation.
8. Sur iPhone Safari: `Partager > Ajouter a l'ecran d'accueil`.

Cette application contient deja:

- `public/manifest.webmanifest`
- `public/sw.js`
- enregistrement automatique du service worker
- bouton d'installation quand le navigateur expose l'evenement PWA

Important: l'installation PWA fonctionne depuis `localhost` en developpement ou depuis une URL `https://` en production.
