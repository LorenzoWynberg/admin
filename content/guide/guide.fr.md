# Guide du panneau d'administration

Comment opérer Mandados au quotidien — de la cotation à la conciliation.

<div class="lead">

**Ce guide s'adresse aux administrateurs** qui répartissent, supervisent et clôturent les commandes dans le panneau Mandados. Vous apprendrez à traiter le cycle complet : recevoir les demandes des clients, générer les devis, assigner les chauffeurs, suivre les livraisons et concilier les montants finaux avec leurs charges ou crédits.

</div>

### Qu'est-ce que Mandados ? {#what-is-mandados}
Mandados est une plateforme de logistique de messagerie du dernier kilomètre. Les clients créent des commandes depuis leur application mobile en indiquant ce qu'ils ont besoin d'acheter, de récupérer ou de faire livrer ; le panneau d'administration gère cette commande pendant tout son cycle de vie ; le chauffeur exécute physiquement l'itinéraire.

### Trois applications, un seul panneau {#three-apps}
| Application | Qui l'utilise | Rôle |
| --- | --- | --- |
| **Client** (mobile) | Particuliers ou entreprises | Créent des commandes, reçoivent des devis, suivent la livraison, notent. |
| **Chauffeur** (mobile) | Messagers salariés | Reçoivent les itinéraires assignés, exécutent les arrêts, enregistrent la preuve de livraison. |
| **Panneau Admin** (web) | Opérations | Cotent, répartissent, surveillent les conflits, concilient, gèrent la tarification. |

<div class="callout info">
<strong>Les chauffeurs sont salariés</strong>
L'objectif de répartition est le <em>bin-packing</em> : maximiser les arrêts par chauffeur pour minimiser la taille de l'équipe. On ne cherche pas une « distribution équitable » des trajets — les itinéraires sont remplis le plus densément possible.
</div>

---

## Connexion au panneau {#signing-in}
Le panneau s'ouvre depuis n'importe quel navigateur moderne. L'écran de connexion demande l'e-mail et le mot de passe.

<figure>
  <img src="/guide/screenshots/01-admin-login.png" alt="Écran de connexion du panneau" />
  <figcaption>Écran de connexion. Utilisez les identifiants fournis par l'équipe des opérations.</figcaption>
</figure>

### Changer la langue {#change-language}
Le panneau est disponible en **espagnol**, **anglais** et **français**. Choisissez la langue depuis la section *Paramètres* ; vous pouvez aussi modifier l'URL en remplaçant le code de langue (`/fr/...`, `/es/...`, `/en/...`).

---

## Vue d'ensemble {#overview}
<figure>
  <img src="/guide/screenshots/02-panel.png" alt="Vue d'ensemble du tableau de bord" />
  <figcaption><em>Tableau de bord</em> — le récapitulatif quotidien avec les métriques opérationnelles.</figcaption>
</figure>

À la connexion vous arrivez au **Tableau de bord** principal. Cet écran résume :

- Les commandes actives, en attente et terminées du jour.
- Les chauffeurs en tournée et disponibles.
- Des métriques rapides de revenus et de volume.

Utilisez le tableau de bord comme point de départ quotidien, mais le vrai poste de travail est [**Demande l'attention**](#needs-attention) — où tout ce qui est actionnable est concentré.

### Menu latéral {#sidebar-menu}
La navigation principale vit dans la barre de gauche. Elle est organisée du plus au moins fréquemment utilisé :

<div class="section-cards">
  <div class="card"><strong class="card-title">Tableau de bord</strong><p>Aperçu quotidien.</p></div>
  <div class="card"><strong class="card-title">Demande l'attention</strong><p>Poste de travail — tout ce qui exige une action manuelle.</p></div>
  <div class="card"><strong class="card-title">Itinéraires</strong><p>Itinéraires actifs avec chauffeurs en mouvement.</p></div>
  <div class="card"><strong class="card-title">Commandes</strong><p>Liste complète des commandes avec filtres.</p></div>
  <div class="card"><strong class="card-title">Devis</strong><p>Historique des devis générés.</p></div>
  <div class="card"><strong class="card-title">Utilisateurs</strong><p>Clients inscrits.</p></div>
  <div class="card"><strong class="card-title">Chauffeurs</strong><p>Personnel salarié.</p></div>
  <div class="card"><strong class="card-title">Entreprises</strong><p>Clients corporatifs avec tarifs négociés.</p></div>
  <div class="card"><strong class="card-title">Adresses</strong><p>Annuaire d'adresses réutilisables.</p></div>
  <div class="card"><strong class="card-title">Catalogues</strong><p>Produits et prix pour les devis.</p></div>
  <div class="card"><strong class="card-title">Règles de tarification</strong><p>Configuration des tarifs par distance, palier, fenêtre, etc.</p></div>
  <div class="card"><strong class="card-title">Notifications</strong><p>Événements système destinés aux opérations.</p></div>
  <div class="card"><strong class="card-title">Journaux d'audit</strong><p>Qui a fait quoi et quand.</p></div>
  <div class="card"><strong class="card-title">Paramètres</strong><p>Devises, fenêtres de service, langue, profil.</p></div>
</div>

---

## Demande l'attention <span class="pill green">l'écran le plus important</span> {#needs-attention}

**C'est l'écran où un administrateur passe la majeure partie de la journée.** Toute commande qui exige une intervention manuelle apparaît ici, classée en onglets selon le type d'action.

<figure>
  <img src="/guide/screenshots/22-needs-attention.png" alt="Onglets de Demande l'attention" />
  <figcaption>Onglets de <em>Demande l'attention</em>. Le nombre sur chaque onglet indique combien de commandes attendent une action.</figcaption>
</figure>

### Les cinq onglets {#five-tabs}
| Onglet | Contenu | Action attendue |
| --- | --- | --- |
| **Conflits** | Commandes que le système n'a pas pu répartir automatiquement ou qui ont des problèmes de faisabilité (fenêtre impossible, aucun chauffeur disponible, distance hors plage). | Examiner le motif, réaffecter manuellement, ajuster la fenêtre ou écarter la commande. |
| **Conciliation** | Commandes <span class="pill blue">Terminée</span> où le chauffeur a livré mais le montant facturé doit être ajusté au coût réel des produits achetés. | Ouvrir la boîte de conciliation, saisir les prix réels par ligne, générer le devis final. |
| **Non Cotées** | Commandes que le client vient de créer et qui n'ont pas encore de devis. | Vérifier les adresses de chaque arrêt, créer le devis et l'envoyer au client. |
| **Non Payées** | Commandes livrées mais non encore payées par le client. | Faire le suivi de l'encaissement, marquer comme payée le moment venu. |
| **Demandes de remboursement** | Réclamations de clients demandant un remboursement total ou partiel. | Examiner les preuves (preuve de livraison, photos), approuver ou rejeter. |

### Filtres de sévérité {#severity-filters}
À l'intérieur de chaque onglet, les commandes sont priorisées par sévérité : <span class="pill red">Critique</span> <span class="pill amber">Élevée</span> <span class="pill blue">Moyenne</span> <span class="pill gray">Basse</span>. Les filtres en haut permettent de cibler le travail du jour.

<div class="callout tip">
<strong>Habitude recommandée</strong>
Commencez chaque journée en passant en revue <em>Conflits</em> puis <em>Non Cotées</em>, dans cet ordre. Conflits peut contenir des commandes urgentes déjà en cours à sauver ; Non Cotées sont des revenus potentiels en attente d'une réponse.
</div>

---

## Cycle de vie d'une commande {#lifecycle}

Une commande traverse quatre phases visibles par l'administrateur. Le système déplace la commande entre les états automatiquement lorsque le chauffeur ou le client effectue une action ; l'administrateur intervient aux points de décision.

<div class="lifecycle">
  <div class="step"><span class="num">1</span><strong>Coter</strong><span>le client crée — l'admin cote</span></div>
  <div class="step"><span class="num">2</span><strong>Approuver</strong><span>le client accepte le devis</span></div>
  <div class="step"><span class="num">3</span><strong>Répartir</strong><span>assigner un chauffeur + itinéraire</span></div>
  <div class="step"><span class="num">4</span><strong>Exécuter</strong><span>récupération et livraison</span></div>
  <div class="step"><span class="num">5</span><strong>Concilier</strong><span>ajuster les montants réels</span></div>
  <div class="step"><span class="num">6</span><strong>Clôturer</strong><span>encaissement et archivage</span></div>
</div>

Les sections suivantes détaillent chaque phase du point de vue de l'administrateur.

---

## 1 · Coter une nouvelle commande {#quote}

Quand un client crée une commande depuis son application, elle arrive dans le panneau à l'état <span class="pill amber">En attente</span> sans devis. Elle apparaîtra dans l'onglet *Non Cotées* de Demande l'attention et en tête de la liste des Commandes.

Pour ce guide nous suivons une vraie commande (`ORD-KA2SEDK3A75X`) créée par le client Lorenzo Wynberg avec la tâche « Acheter 2 boîtes de lait et du pain à Auto Mercado » et livraison à Calle 6, Hospital, San José.

<figure>
  <img src="/guide/screenshots/21-orders-list.png" alt="Liste des commandes montrant une commande en attente récemment créée" />
  <figcaption>La commande nouvellement créée apparaît en haut de la liste des Commandes avec l'état <em>En attente · Non payée</em>.</figcaption>
</figure>

### Étape 1.1 — La repérer dans Demande l'attention {#step-1-1}
Quand la commande arrive, le compteur de l'onglet *Non Cotées* augmente. C'est le premier signal de la journée.

<figure>
  <img src="/guide/screenshots/22-needs-attention.png" alt="Demande l'attention avec un badge sur Non Cotées" />
  <figcaption>L'onglet <em>Non Cotées</em> affiche <strong>1</strong> — une commande en attente de cotation.</figcaption>
</figure>

### Étape 1.2 — Ouvrir le détail de la commande {#step-1-2}
Cliquez sur la commande pour ouvrir son détail. À ce stade vous verrez les arrêts, les détails horaires, l'historique des devis (vide ici) et les paiements.

<figure>
  <img src="/guide/screenshots/23-order-detail-pending.png" alt="Détail d'une commande en attente sans devis" />
  <figcaption>Détail de la commande en état d'attente. Notez l'avertissement jaune en haut et que l'arrêt de récupération n'a que la description (« Acheter 2 boîtes de lait et du pain à Auto Mercado ») mais aucune adresse — le bouton <em>+ Ajouter une adresse</em> permet d'en assigner une.</figcaption>
</figure>

<div class="callout warn">
<strong>Tous les arrêts doivent avoir une adresse avant de coter</strong>
Quand le client ne décrit que la tâche sans fixer de lieu, l'administrateur doit ajouter l'adresse du commerce où l'achat aura lieu. Sans adresses complètes, le bouton <em>Créer un devis</em> est désactivé.
</div>

### Étape 1.3 — Ajouter l'adresse de récupération {#step-1-3}
1. Sur la carte *Arrêts*, cliquez sur `+ Ajouter une adresse` dans l'arrêt de récupération.
2. Cherchez le commerce dans l'annuaire [Adresses](#addresses) ou saisissez-en une nouvelle.
3. Confirmez. L'arrêt est complété, l'avertissement jaune disparaît, et les boutons `Créer un devis` et `Calculer la distance` apparaissent.

<figure>
  <img src="/guide/screenshots/30-order-ready-to-quote.png" alt="Commande avec toutes les adresses complètes, prête à coter" />
  <figcaption>La commande a maintenant Auto Mercado Sabana Sur comme adresse de récupération. Le bouton <em>Créer un devis</em> est actif en haut à droite.</figcaption>
</figure>

### Étape 1.4 — Créer le devis (Brouillon) {#step-1-4}
1. Cliquez sur `Créer un devis`.
2. Une boîte de dialogue s'ouvre où vous pouvez :
   - Ajouter des lignes de produits par arrêt (description, quantité, prix unitaire estimé) — depuis un catalogue ou saisies à la main.
   - Appliquer un palier de service : <span class="pill gray">Régulier</span>, <span class="pill amber">Express</span>, <span class="pill red">Urgent</span>.
   - Ajouter des suppléments spéciaux ou des remises.
3. Le système calcule automatiquement les frais de livraison selon la distance, le palier et la fenêtre de service d'après les [Règles de tarification](#pricing).
4. À la sauvegarde, le devis reste à l'état <span class="pill gray">Brouillon</span> — enregistré mais pas encore visible par le client.

<figure>
  <img src="/guide/screenshots/31-order-quote-draft.png" alt="Commande avec un devis brouillon" />
  <figcaption>Le devis apparaît dans l'<em>Historique des devis</em> étiqueté <em>Brouillon</em>. Total estimé : ₡7 684,00 (base, distance et produits estimés inclus).</figcaption>
</figure>

### Étape 1.5 — Envoyer le devis au client {#step-1-5}
Quand le devis est revu, cliquez sur `Envoyer au client`. Le statut du devis passe à <span class="pill blue">Envoyé</span> et celui de la commande à <span class="pill blue">Cotée</span>. Le client reçoit une notification dans son application et peut accepter ou rejeter.

<figure>
  <img src="/guide/screenshots/32-order-quote-sent.png" alt="Devis envoyé au client" />
  <figcaption>État mis à jour : commande <em>Cotée</em> — en attente de la réponse du client. Le bouton <em>Sous-traiter</em> apparaît également pour les scénarios où les opérations doivent sous-traiter.</figcaption>
</figure>

### Étape 1.6 — Le client accepte → commande Approuvée {#step-1-6}
Quand le client accepte depuis son application, la commande passe automatiquement à <span class="pill green">Approuvée</span>. Le devis montre déjà les lignes de produits estimés et la commande est prête à être répartie.

<figure>
  <img src="/guide/screenshots/33-order-approved.png" alt="Commande approuvée avec devis accepté" />
  <figcaption>État <em>Approuvée</em>. Le devis <em>QUO-K9N5EXSZ6NFY</em> est <em>Accepté</em>. Les lignes de produits sont visibles sous chaque arrêt.</figcaption>
</figure>

### États du devis {#quote-states}
| État | Signification |
| --- | --- |
| <span class="pill gray">Brouillon</span> | Enregistré mais non envoyé — seul l'administrateur le voit. |
| <span class="pill blue">Envoyé</span> | Visible par le client ; en attente de son approbation. |
| <span class="pill green">Accepté</span> | Le client a accepté. La commande passe à <span class="pill green">Approuvée</span>. |
| <span class="pill red">Rejeté</span> | Le client a refusé. Vous pouvez générer un autre devis si nécessaire. |
| <span class="pill gray">Expiré</span> | La date de validité est passée sans acceptation. |
| <span class="pill green">Finalisé</span> | Généré à la clôture après la conciliation. |

<figure>
  <img src="/guide/screenshots/20-quotes-list.png" alt="Liste des devis" />
  <figcaption>Section <em>Devis</em> — historique complet de tous les devis du système, avec filtres par état, date et montant.</figcaption>
</figure>

---

## 2 · Répartir la commande {#dispatch}

Une commande <span class="pill green">Approuvée</span> est prête à recevoir un chauffeur et à se voir créer un itinéraire. Le système tente de le faire automatiquement via `AutoDispatchService`, qui évalue :

- La faisabilité horaire par rapport à la fenêtre du client.
- La distance depuis la position actuelle / la prochaine destination du chauffeur.
- La capacité restante du véhicule.
- La densité de l'itinéraire — l'algorithme préfère ajouter des arrêts à un chauffeur déjà actif dans la zone plutôt que d'assigner à un chauffeur inactif (stratégie de *bin-packing*).

<div class="callout info">
<strong>Répartition automatique vs manuelle</strong>
La grande majorité des commandes se répartit toute seule. L'administrateur intervient quand un conflit apparaît : la commande tombe dans l'onglet <em>Conflits</em> de Demande l'attention avec le motif décrit.
</div>

### Résultat de la répartition {#dispatch-result}
Une fois assignée, l'état passe à <span class="pill blue">Chauffeur assigné</span>, l'arrêt de récupération est reclassé en *Achat* (parce qu'il a des produits à acheter) et une entrée apparaît dans la section Itinéraires.

<figure>
  <img src="/guide/screenshots/35-order-assigned.png" alt="Commande avec chauffeur assigné" />
  <figcaption>Commande avec <em>Chauffeur assigné</em>. L'arrêt est renommé <em>Achat</em> reflétant que le chauffeur doit acquérir les produits avant de les livrer.</figcaption>
</figure>

<figure>
  <img src="/guide/screenshots/36-routes-active.png" alt="Section Itinéraires avec le nouvel itinéraire assigné" />
  <figcaption>Section <em>Itinéraires</em>. Le nouvel itinéraire <em>RTE-FBU8B79YW4JT</em> a deux arrêts (Achat → Livraison), une carte en direct, et les boutons <em>Sous-traiter le chauffeur</em> et <em>Optimiser l'itinéraire</em>.</figcaption>
</figure>

### Quand il y a un conflit {#dispatch-conflict}
Si le système ne trouve pas de répartition faisable, la commande reste dans *Conflits*. Les actions typiques sont :

1. **Assigner manuellement** — ouvrir la commande, cliquer sur `Assigner un chauffeur`, choisir dans la liste.
2. **Ajuster la fenêtre** — étendre la plage horaire si la seule cause est la disponibilité.
3. **Sous-traiter** — payer un prestataire externe. Seulement en dernier recours, car cela réduit la marge.
4. **Annuler** — retourner vers le client avec une explication.

<div class="callout warn">
<strong>Une seule livraison par commande</strong>
Chaque commande a exactement un point de livraison final. Si le client doit livrer à plusieurs destinations différentes, il doit créer des commandes séparées. Le système rejette un second arrêt de type « livraison » dans la même commande.
</div>

---

## 3 · Surveiller l'exécution {#monitor}

Une fois assignée, la commande parcourt les états au fur et à mesure que le chauffeur avance :

| État | Signification |
| --- | --- |
| <span class="pill blue">Chauffeur assigné</span> | Le chauffeur a reçu l'assignation mais n'a pas encore commencé. |
| <span class="pill blue">En récupération</span> · <span class="pill blue">Arrive</span> · <span class="pill blue">Sur place</span> | Sous-états pendant la phase de récupération/achat. |
| <span class="pill blue">Récupérée</span> | Achats faits, prêts à livrer. |
| <span class="pill blue">En transit</span> | En route vers la destination finale. |
| <span class="pill blue">Arrive</span> · <span class="pill blue">Sur place</span> (livraison) | Sous-états de la phase de livraison. |
| <span class="pill amber">En attente de confirmation</span> | En attente du PIN client ou de la photo de preuve. |
| <span class="pill green">Terminée</span> | Livrée avec preuve enregistrée. |

### Récupération — le chauffeur achète {#monitor-pickup}
<figure>
  <img src="/guide/screenshots/37-order-picking-up.png" alt="Commande à l'état En récupération" />
  <figcaption>État <em>En récupération</em> — le chauffeur est sur place ou en route vers le commerce pour faire l'achat.</figcaption>
</figure>

### En transit — en route vers la destination {#monitor-transit}
<figure>
  <img src="/guide/screenshots/39-order-in-transit-active.png" alt="Commande en transit" />
  <figcaption>État <em>En transit</em> — l'achat est fait et le chauffeur est en route vers le client.</figcaption>
</figure>

### Livraison terminée {#monitor-delivered}
Quand la livraison est confirmée avec PIN et photo, la commande passe à <span class="pill green">Terminée</span>. Les arrêts sont marqués <em>Terminé</em>.

<figure>
  <img src="/guide/screenshots/40-order-completed-needs-reconciliation.png" alt="Commande terminée en attente de conciliation" />
  <figcaption>Commande <em>Terminée</em> avec arrêts finalisés. Le devis original reste comme référence et le paiement apparaît à l'état <em>Autorisé</em> (pré-autorisé, prêt à capturer le montant final après la conciliation).</figcaption>
</figure>

### PIN et preuve de livraison {#pin-and-pod}
Chaque commande a un **PIN à 6 chiffres** généré à la création de la commande. Le client le reçoit dans son application ; le chauffeur doit le demander à la livraison pour confirmer l'identité. Selon la configuration, peuvent également être requis :

- **Preuve photographique** — le chauffeur prend une photo du colis livré.
- **Signature** — le destinataire signe à l'écran.

Sans la preuve requise, la commande reste à l'état <span class="pill amber">En attente de confirmation</span> jusqu'à résolution.

---

## 4 · Concilier les montants finaux {#reconcile}

La conciliation est l'ajustement post-livraison : le devis initial est une *estimation* du coût des produits. Le prix réel n'est connu qu'au moment où le chauffeur achète. La conciliation rapproche les deux montants et génère une charge ou un crédit s'il y a une différence.

<div class="callout info">
<strong>Quand elle apparaît</strong>
Les commandes <span class="pill green">Terminée</span> avec paiement <em>Autorisé</em> non concilié apparaissent dans l'onglet <em>Conciliation</em> de Demande l'attention.
</div>

<figure>
  <img src="/guide/screenshots/41-needs-attention-conciliacion.png" alt="Onglet Conciliation avec une commande en attente" />
  <figcaption>L'onglet <em>Conciliation</em> affiche <strong>1</strong> — la commande à peine terminée attend l'ajustement des montants.</figcaption>
</figure>

### Étape 4.1 — Ouvrir la boîte de conciliation {#step-4-1}
Depuis le détail d'une commande terminée avec paiement autorisé, un bouton `Concilier` apparaît dans l'en-tête (accessible aussi directement depuis l'onglet *Conciliation* de Demande l'attention). Cliquer dessus ouvre le formulaire complet.

<figure>
  <img src="/guide/screenshots/42-reconciliation-dialog.png" alt="Boîte de conciliation ouverte sur la commande terminée" />
  <figcaption>Boîte <em>Concilier la commande</em>. L'en-tête affiche <em>Total du devis original</em> (₡7 684,00) et <em>Le client a payé</em>. Sous <em>Articles</em> chaque arrêt d'achat est listé avec ses lignes (quantité + prix unitaire modifiables et un total par ligne). Le pied calcule <em>Frais de service</em>, <em>Total des articles</em>, <em>Taxe</em>, <em>Nouveau total estimé</em> et la <strong>Différence</strong> (delta) en rouge ou vert selon le signe.</figcaption>
</figure>

### Étape 4.2 — Ajuster les lignes avec les prix réels {#step-4-2}
1. Pour chaque ligne, modifiez la *Quantité* et le *Prix unitaire* en utilisant ce qui a été réellement payé (basé sur le ticket d'achat). Par exemple, si la *Boîte de lait 1L (×2)* cotée à ₡1 500 est sortie à ₡1 700, entrez ₡1 700.
2. Si le chauffeur a acquis des extras qui n'étaient pas dans le devis, cliquez sur `+ Ajouter un article` et enregistrez la nouvelle ligne.
3. Si un article n'a pas été trouvé, cliquez sur le *×* en fin de ligne pour la supprimer — elle sort du total.
4. Utilisez le champ *Notes* pour laisser au client un contexte sur l'ajustement (optionnel mais recommandé en cas de surcharge).
5. Vérifiez la ligne *Différence* : positif = surcharge (le client doit la différence), négatif = crédit (on facture moins que l'autorisé), zéro = pas d'ajustement.

### Étape 4.3 — Générer la conciliation {#step-4-3}
À la confirmation de la boîte, le système :

- Crée un nouveau devis à l'état <span class="pill green">Finalisé</span> (version 2).
- Capture du paiement autorisé le montant final correct. Si le réel est inférieur à l'autorisé, seul le réel est capturé. S'il est supérieur, le paiement est marqué <span class="pill amber">Surcharge en attente</span>.
- Estampille la commande avec `reconciled_at` et la retire de l'onglet *Conciliation*.

<figure>
  <img src="/guide/screenshots/42-order-reconciled.png" alt="Commande après la conciliation" />
  <figcaption>Commande après conciliation. Le nouveau devis <em>Finalisé</em> v2 apparaît avec le montant réel (₡10 339,50) à côté du devis original accepté (₡7 684,00). Le paiement <em>Autorisé</em> a été capturé au montant correct.</figcaption>
</figure>

### Résultats possibles {#reconciliation-outcomes}
| Différence | Résultat | État du paiement |
| --- | --- | --- |
| Réel = coté | Pas d'ajustement — capture du montant autorisé. | <span class="pill green">Payé</span> |
| Réel &lt; coté | Capture du montant réel (plus bas). Le client ne paie que ce qui a réellement été acheté. | <span class="pill green">Payé</span> |
| Réel &gt; coté | Surcharge — le client doit payer la différence, généralement via un second prélèvement ou solde. | <span class="pill amber">Surcharge en attente</span> jusqu'à couverture. |

<div class="callout tip">
<strong>Le paiement est « autorisé » avant la livraison</strong>
Quand le devis est accepté, la passerelle de paiement autorise une retenue pour le montant coté mais <em>ne facture pas encore</em>. La conciliation déclenche la capture finale : au montant exact, ni plus ni moins. Cela évite les remboursements et les charges surprises.
</div>

---

## Commandes {#orders}

<figure>
  <img src="/guide/screenshots/21-orders-list.png" alt="Liste complète des commandes" />
  <figcaption>Liste des commandes avec filtres d'état, de dates et d'itinéraires.</figcaption>
</figure>

La liste complète des commandes — la source de vérité pour les rapports et les recherches historiques. Filtres disponibles :

- État de la commande (tous les états du cycle).
- État de paiement (Payée, Non payée, Surcharge).
- Récupération et livraison programmées.
- Recherche par code de commande ou client.

### Anatomie de la page de détail d'une commande {#order-detail}

<figure>
  <img src="/guide/screenshots/16-order-detail.png" alt="Détail complet d'une commande" />
  <figcaption>Détail complet de la commande — informations, arrêts, devis, paiements.</figcaption>
</figure>

La page de détail montre :

- **En-tête** — code de commande, état, date de création, actions rapides (annuler, supprimer, assigner).
- **Arrêts** — tous les arrêts en ordre, avec adresse, description et état individuel.
- **Détails de la commande** — palier de service, fenêtre, exigences (PIN, photo, signature), distance et durée estimée.
- **Historique des devis** — tous les devis générés (initial + finalisé après conciliation).
- **Paiements** — registres des paiements associés.
- **Chronologie** — événements du cycle de vie horodatés.

---

## Devis {#quotes}

<figure>
  <img src="/guide/screenshots/20-quotes-list.png" alt="Section des devis" />
  <figcaption>Liste des devis. Chaque devis est lié à une commande.</figcaption>
</figure>

Vue alternative centrée sur les devis — utile pour auditer les changements de prix, voir les taux d'acceptation ou renvoyer des devis expirés.

---

## Itinéraires {#routes}

<figure>
  <img src="/guide/screenshots/04-routes.png" alt="Section Itinéraires" />
  <figcaption>Itinéraires actifs avec chauffeurs en mouvement.</figcaption>
</figure>

Vue opérationnelle en direct. Chaque itinéraire regroupe plusieurs arrêts assignés au même chauffeur. La densité de l'itinéraire est l'objectif de l'algorithme de répartition — il cherche toujours à empiler davantage d'arrêts dans moins d'itinéraires.

---

## Chauffeurs {#drivers}

Section critique du panneau. C'est ici que l'on gère les messagers qui exécutent les livraisons : données personnelles, permis, véhicule, lieu de base et — le plus important — **leur disponibilité horaire**, car sans horaire configuré le système ne peut assigner de commandes à un chauffeur.

<figure>
  <img src="/guide/screenshots/50-drivers-list.png" alt="Liste des chauffeurs avec deux entrées" />
  <figcaption>Liste des chauffeurs. Le bouton <em>+ Créer un chauffeur</em> est dans le coin supérieur droit. Chaque ligne affiche l'état <em>Actif / Inactif</em>, le numéro et l'expiration du permis, la plaque du véhicule et la date de création.</figcaption>
</figure>

### Internes vs externalisés (outsourced) {#internal-vs-outsourced}
Le système distingue deux types de chauffeurs :

| Type | Quand l'utiliser | Caractéristiques |
| --- | --- | --- |
| **Interne** (salarié) | Opération régulière, au quotidien. | Salaire fixe. Possède un **horaire configurable** et un **lieu de base**. Le système le considère pour la répartition automatique selon la faisabilité. |
| **Externalisé** (outsourced) | Quand aucun chauffeur interne n'est faisable pour une commande et que la fenêtre ne peut pas être ajustée. | Prestataire externe payé au voyage. **Pas** d'horaire ni de lieu de base — sa disponibilité est supposée à la demande. Réduit la marge ; à utiliser avec discernement. |

<div class="callout info">
<strong>Internes salariés, pas au voyage</strong>
Les chauffeurs internes reçoivent un salaire fixe. Cela change la logique d'affectation : il n'y a pas d'incitation à « répartir » les voyages — on privilégie l'efficacité opérationnelle (itinéraires denses, minimum de chauffeurs actifs).
</div>

### Détail du chauffeur — onglet Détails {#driver-details}

<figure>
  <img src="/guide/screenshots/51-driver-detail.png" alt="Détail d'un chauffeur interne" />
  <figcaption>Onglet <em>Détails</em>. En-tête avec nom, ID public, bascule <em>Actif</em> et bouton <em>Supprimer</em>. Quatre cartes avec les informations essentielles.</figcaption>
</figure>

L'onglet *Détails* contient cinq cartes :

| Carte | Contenu | Actions |
| --- | --- | --- |
| **Compte utilisateur** | Nom, e-mail, téléphone. | Le bouton <em>Voir le profil utilisateur</em> ouvre le compte du chauffeur dans la section Utilisateurs. |
| **Informations du permis** | Numéro de permis et date d'expiration. | Si le permis est expiré, l'étiquette <span class="pill red">Expiré</span> apparaît automatiquement. |
| **Informations du véhicule** | Plaque du véhicule. | Modifiable. |
| **Dates** | Date de création et dernière mise à jour de l'enregistrement. | Lecture seule. |
| **Lieu de base** <span class="pill gray">internes uniquement</span> | Coordonnées et adresse d'où le chauffeur commence/termine son service. | Le bouton <em>Modifier/Définir</em> ouvre une carte pour fixer la position. Utilisé pour les calculs de faisabilité de la répartition. |

#### Bascule Actif

La bascule *Actif* dans le coin supérieur droit contrôle si le chauffeur est globalement disponible pour les assignations. Utile pour les vacances, suspensions ou congés prolongés — bascule sans avoir à supprimer l'enregistrement.

### Configurer l'horaire du chauffeur — onglet Horaire {#driver-schedule}

**C'est la configuration critique pour que le chauffeur puisse recevoir des commandes.** Sans blocs de disponibilité, l'algorithme de répartition automatique ne le considérera pas — il ne recevra jamais d'arrêts.

<figure>
  <img src="/guide/screenshots/52-driver-schedule.png" alt="Calendrier de disponibilité du chauffeur" />
  <figcaption>Onglet <em>Horaire</em> — calendrier de disponibilité hebdomadaire. Les blocs bleus sont des quarts futurs programmés ; les blocs gris sont les jours passés (non modifiables).</figcaption>
</figure>

#### Comment fonctionne le calendrier

- **Vue par défaut : Semaine**, avec des heures de 4h00 à 22h00. Le bouton *Mois* bascule en vue mensuelle.
- **Chaque bloc bleu est un quart disponible** — pendant cette plage le chauffeur peut recevoir des assignations.
- **Les jours passés s'affichent en gris** et sont en lecture seule (on ne modifie pas l'historique).
- **Le jour courant est mis en évidence** en jaune clair.

#### Créer un bloc de disponibilité

1. Cliquez sur le jour et l'heure souhaités dans le calendrier, ou faites glisser pour sélectionner une plage.
2. Une boîte s'ouvre où vous pouvez ajuster l'heure de début et de fin du bloc.
3. Confirmez. Le bloc reste dans le calendrier comme quart programmé.
4. Répétez pour couvrir toute la semaine de travail du chauffeur.
5. **Important :** appuyez sur `Enregistrer` dans le coin supérieur droit quand vous avez terminé — les changements ne sont pas persistés tant que vous ne les enregistrez pas.

#### Modifier ou supprimer un bloc

1. Cliquez sur un bloc existant.
2. La boîte s'ouvre en mode édition — vous pouvez ajuster les heures ou cliquer sur `Supprimer`.
3. N'oubliez pas d'enregistrer les changements à la fin.

<div class="callout warn">
<strong>Le passé ne se modifie pas</strong>
Les jours antérieurs au jour courant sont verrouillés. Si vous devez corriger un historique d'horaires, passez par l'équipe technique (le changement peut affecter les rapports et les métriques).
</div>

<div class="callout tip">
<strong>Modèle recommandé</strong>
Configurez les horaires de la semaine suivante chaque vendredi. Utilisez des blocs du matin (08:00–12:00) et de l'après-midi (13:00–17:00) séparés par une heure de déjeuner, ou un bloc continu (08:00–17:00) selon le contrat. Les blocs multiples par jour permettent de respecter les pauses légales sans que l'algorithme assigne des arrêts pendant le déjeuner.
</div>

### Créer un nouveau chauffeur {#driver-create}

<figure>
  <img src="/guide/screenshots/53-driver-create.png" alt="Formulaire de création d'un chauffeur" />
  <figcaption>Formulaire <em>Créer un chauffeur</em>. La section <em>Personal Information</em> en haut (nom, e-mail, téléphone, mot de passe, date de naissance, sexe, langue, avatar) et <em>License Information</em> en bas (numéro de permis, plaque du véhicule).</figcaption>
</figure>

L'inscription d'un nouveau chauffeur exige :

| Champ | Obligatoire | Notes |
| --- | --- | --- |
| Nom complet | Oui | Apparaîtra dans les notifications client et dans la liste. |
| E-mail | Oui | Sera l'identifiant d'accès à l'application mobile du chauffeur. |
| Téléphone | Oui | Format Costa Rica : `+506 XXXX-XXXX`. |
| Mot de passe | Oui | Générez-en un temporaire — le chauffeur pourra le changer à sa première connexion. |
| Date de naissance | Oui | Vérification de la majorité et données de paie. |
| Sexe | Oui | Liste prédéfinie. |
| Code de langue | Oui | Langue dans laquelle il recevra les notifications (es / en / fr). |
| Avatar | Non | Photo que verront les clients et le tableau d'administration. |
| Numéro de permis | Oui | Le format est validé. |
| Plaque du véhicule | Oui | Format CR : `ABC-123`. |
| Date d'expiration du permis | Oui | Le système marque <span class="pill red">Expiré</span> au passage de la date. |
| Photo du permis (recto et verso) | Oui | Joindre un PDF ou une image pour l'audit. |

#### Après la création du chauffeur

1. Ouvrez le détail du chauffeur fraîchement créé.
2. Dans l'onglet *Détails*, configurez le **Lieu de base** (d'où il part travailler).
3. Passez à l'onglet *Horaire* et configurez sa disponibilité pour la semaine en cours.
4. Activez la bascule *Actif* si elle ne l'est pas.

Ce n'est qu'après ces trois étapes que le chauffeur sera prêt à recevoir des assignations automatiques.

---

## Utilisateurs {#users}

<figure>
  <img src="/guide/screenshots/07-users.png" alt="Liste des utilisateurs" />
  <figcaption>Clients (personnes physiques) inscrits sur la plateforme.</figcaption>
</figure>

Clients individuels. Vous pouvez ici voir l'historique des commandes par client, les méthodes de paiement enregistrées et l'état du compte.

---

## Entreprises {#businesses}

<figure>
  <img src="/guide/screenshots/09-businesses.png" alt="Liste des entreprises" />
  <figcaption>Clients corporatifs.</figcaption>
</figure>

Comptes d'entreprise. Les entreprises peuvent avoir :

- Plusieurs utilisateurs autorisés à créer des commandes.
- Des tarifs négociés différents de ceux du grand public.
- Une facturation consolidée mensuelle.
- Leur propre catalogue d'adresses fréquentes.

---

## Adresses {#addresses}

<figure>
  <img src="/guide/screenshots/10-addresses.png" alt="Annuaire d'adresses" />
  <figcaption>Annuaire réutilisable d'adresses de commerces et de clients fréquents.</figcaption>
</figure>

Annuaire partagé. Maintenir cet annuaire à jour accélère la cotation : au lieu de géocoder à la main « Auto Mercado, Sabana Sur » à chaque fois, on le sélectionne dans l'annuaire.

---

## Catalogues {#catalogs}

<figure>
  <img src="/guide/screenshots/11-catalogs.png" alt="Catalogues de produits" />
  <figcaption>Catalogues de produits pour des devis rapides.</figcaption>
</figure>

Listes de produits préchargées avec prix suggérés. Lors de la cotation, l'administrateur peut sélectionner des lignes du catalogue au lieu de les saisir manuellement. Utile pour les clients récurrents ou les paniers standardisés.

---

## Règles de tarification {#pricing}

<figure>
  <img src="/guide/screenshots/12-pricing.png" alt="Règles de tarification" />
  <figcaption>Configuration des tarifs par distance, palier et fenêtre de service.</figcaption>
</figure>

Définit comment le système calcule le coût de livraison. Variables principales :

- **Distance** — tarif de base + coût au kilomètre.
- **Palier** — Régulier, Express, Urgent — multiplient le tarif de base.
- **Fenêtre de service** — horaire ouvrable vs nocturne ou férié.
- **Suppléments spéciaux** — poids additionnel, manipulation fragile, etc.

<div class="callout warn">
<strong>Les changements affectent les devis futurs</strong>
Les devis déjà émis conservent leur prix. Seuls les nouveaux devis recalculent avec les règles mises à jour.
</div>

---

## Notifications {#notifications}

<figure>
  <img src="/guide/screenshots/13-notifications.png" alt="Centre de notifications" />
  <figcaption>Centre de notifications — événements pertinents pour les opérations.</figcaption>
</figure>

Flux d'événements système destinés à l'équipe d'administration : nouvelles commandes, devis acceptés, conflits de répartition, chauffeurs signalant des problèmes, encaissements échoués, demandes de remboursement. Tous les champs sont en `camelCase` et suivent les types définis dans `Api.Broadcast.*`.

---

## Journaux d'audit {#audit-logs}

<figure>
  <img src="/guide/screenshots/14-audit-logs.png" alt="Journaux d'audit" />
  <figcaption>Journal de qui a fait quoi.</figcaption>
</figure>

Registre immuable de toutes les actions administratives. Utile pour :

- Enquêter sur des écarts dans les commandes (qui a annulé ? qui a changé le tarif ?).
- Conformité réglementaire.
- Formation — passer en revue les actions du personnel nouveau.

---

## Paramètres {#settings}

<figure>
  <img src="/guide/screenshots/15-settings.png" alt="Paramètres généraux" />
  <figcaption>Écran <em>Paramètres</em>. Trois cartes : <em>Langue</em> (sélecteur en ligne), <em>Paramètres de devise</em> et <em>Fenêtre de service</em> (les deux dernières ouvrent des sous-pages via la flèche droite).</figcaption>
</figure>

C'est ici que vivent les paramètres globaux de l'opération. Attention : la liste est volontairement courte — seulement ce qu'un administrateur doit changer à la main. Le reste du comportement (tarifs, fenêtres par commande, faisabilité de la répartition) est modélisé dans ses propres sections.

### Langue

Change la langue de l'interface pour l'administrateur courant entre **espagnol**, **anglais** et **français**. La sélection persiste par utilisateur et réécrit le préfixe de l'URL (`/fr/...`, `/es/...`, `/en/...`).

### Paramètres de devise {#settings-currencies}

<figure>
  <img src="/guide/screenshots/15b-currencies.png" alt="Écran Paramètres de devise en mode automatique" />
  <figcaption>Écran <em>Paramètres de devise</em> en mode <em>Automatique</em>. De haut en bas : bouton <em>Synchroniser les taux</em>, carte <em>Mode du taux de change</em>, carte <em>Devise de base</em> (CRC avec précision 2 décimales) et tableau des devises activées.</figcaption>
</figure>

Cette section contrôle quelles devises la plateforme accepte, comment les taux de change sont obtenus et comment chacune est arrondie à l'affichage des prix. Toute règle de prix et tout devis sont stockés en interne dans la **devise de base** ; les autres devises sont converties depuis cette base à l'affichage.

#### Mode du taux de change : Automatique vs Manuel

Le premier interrupteur décide comment les taux sont obtenus :

- **Automatique** <span class="pill green">par défaut</span> — le système télécharge les taux depuis des fournisseurs externes (p. ex. *gometa*) et les rafraîchit de manière programmée. Le bouton `Synchroniser les taux` apparaît en haut à droite pour forcer une mise à jour immédiate.
- **Manuel** — l'administrateur fixe le taux de change à la main par devise. Utile quand on veut utiliser un taux fixe négocié avec une banque ou isoler l'opération des oscillations intraday.

<figure>
  <img src="/guide/screenshots/15b3-currency-manual-mode.png" alt="Paramètres de devise en mode Manuel" />
  <figcaption>Le même panneau après avoir basculé le commutateur sur <em>Manuel</em>. Le bouton <em>Synchroniser les taux</em> disparaît, la colonne <em>Date du taux</em> de chaque devise non-base affiche l'étiquette <span class="pill gray">Manuel</span>, et le <em>Taux de change</em> reste à <em>–</em> jusqu'à saisie manuelle.</figcaption>
</figure>

#### Devise de base

La carte *Devise de base* indique dans quelle devise sont stockés tous les montants internes (dans l'exemple, CRC avec précision de 2 décimales). Elle ne peut pas être désactivée et son taux de change est toujours `1.000000`. Changer la devise de base est une opération de migration — elle ne se fait pas depuis ce panneau.

#### Tableau des devises

Le tableau liste toutes les devises configurées. Colonnes :

| Colonne | Ce qu'elle affiche |
| --- | --- |
| **Code / Nom / Symbole** | Identifiants ISO 4217 et la devise affichée (p. ex. `USD · US Dollar · $`). |
| **Taux de change** | Taux actuel par rapport à la devise de base. En mode manuel affiche le taux fixé par l'admin. |
| **Date du taux** | Quand il a été mis à jour pour la dernière fois, avec étiquette de la source (p. ex. *gometa*) ou <span class="pill gray">Manuel</span>. |
| **Arrondi** | Résumé du mode + incrément (p. ex. `nearest @ 0.01`). |
| **État** | <span class="pill blue">Base</span>, <span class="pill green">Actif</span> ou <span class="pill gray">Désactivé</span>. |
| **Activé** | Bascule pour activer/désactiver. La devise de base ne peut pas être désactivée. |
| **Actions** | Bouton <em>Modifier</em> — ouvre la boîte de configuration de la devise. |

#### Boîte d'édition — arrondi

<figure>
  <img src="/guide/screenshots/15b2-currency-rounding-edit.png" alt="Boîte d'édition de l'arrondi" />
  <figcaption>Boîte <em>Modifier les paramètres d'arrondi</em>. Deux champs : <em>Mode d'arrondi</em> (Au plus proche, Arrondir vers le haut, Arrondir vers le bas) et <em>Incrément d'arrondi</em> (0,01 = centimes, 0,10 = dixièmes, 0,50, 1,00…).</figcaption>
</figure>

L'arrondi affecte la façon dont les montants sont présentés au client final, pas leur stockage interne. Par exemple, un devis calculé à ₡7 683,50 avec incrément `1` et mode *Au plus proche* s'affiche ₡7 684.

#### Boîte d'édition — taux manuel (mode Manuel uniquement)

<figure>
  <img src="/guide/screenshots/15b4-currency-manual-rate-edit.png" alt="Boîte d'édition avec taux manuel pour USD" />
  <figcaption>En mode <em>Manuel</em>, modifier une devise non-base fait apparaître le champ <em>Taux de change manuel</em>. L'aperçu de conversion montre les deux sens (1 USD = 490 CRC et 1 CRC = 0,002041 USD) et avertit si la valeur semble inversée.</figcaption>
</figure>

<div class="callout warn">
<strong>Sens du taux</strong>
Le taux se saisit comme <em>combien d'unités de la devise de base équivalent à 1 unité de cette devise</em>. Si on saisit par erreur à l'envers (p. ex. <code>0,002</code> au lieu de <code>490</code>), l'aperçu peint une alerte ambre suggérant la valeur inverse.
</div>

### Fenêtre de service {#settings-service-window}

<figure>
  <img src="/guide/screenshots/15c-service-window.png" alt="Écran Fenêtre de service" />
  <figcaption>Écran <em>Fenêtre de service</em>. Trois cartes : activer/désactiver, <em>Horaire d'opération</em> (avec la barre visuelle vert/rouge quand active) et <em>Escalade des commandes non assignées</em>.</figcaption>
</figure>

C'est ici que l'on définit quand la plateforme accepte de nouvelles commandes et quoi faire de celles qui restent sans chauffeur trop longtemps. Cette configuration est globale — elle affecte clients, chauffeurs et l'algorithme de répartition de la même manière.

#### Activer / désactiver la fenêtre

Le premier interrupteur allume ou éteint la fenêtre de service. **Quand elle est désactivée**, les clients peuvent créer des commandes 24/7 et l'algorithme ne rejette rien pour des raisons d'horaire. **Quand elle est activée**, les commandes hors de l'horaire d'opération sont bloquées ou mises en file pour l'intervalle suivant.

#### Horaire d'opération

Deux champs horaires contrôlent la fenêtre du jour :

- *Le service ferme à* — l'heure où l'on cesse d'accepter du travail (début du bloc fermé).
- *Le service ouvre à* — l'heure où l'opération reprend (fin du bloc fermé).

Si la fenêtre franchit minuit, la barre chronologique la dessine correctement : deux segments verts aux extrémités du jour et un segment rouge au milieu (fermé). Dans le cas normal (ouverture le matin et fermeture le soir), on voit un segment vert central entouré de deux rouges.

#### Escalade des commandes non assignées

Les commandes payées qui n'obtiennent pas de chauffeur escaladent automatiquement pour éviter d'être oubliées :

- **Annulation automatique activée** — si activée, les commandes qui atteignent le seuil sont annulées avec remboursement complet. Si désactivée, on se contente de notifier l'admin et la commande reste ouverte jusqu'à intervention manuelle.
- **Seuil d'escalade (heures ouvrables)** — nombre d'heures *à l'intérieur de la fenêtre de service* après lesquelles l'escalade se déclenche. Le champ accepte 1–24.

<div class="callout info">
<strong>« Heures ouvrables », pas l'horloge murale</strong>
Le seuil ne compte que les heures à l'intérieur de la fenêtre de service. Une commande qui entre à 23h00 avec fenêtre 08h00–22h00 et seuil de 4 heures n'escalade pas à 3h00 — elle escalade à midi le lendemain, après 4 heures réelles d'opération ouverte.
</div>

---

## Glossaire des états {#state-glossary}

### États de la commande {#order-states}
| Code interne | Étiquette | Signification |
| --- | --- | --- |
| `pending` | <span class="pill amber">En attente</span> | Le client a créé la commande — en attente de devis. |
| `estimated` | <span class="pill blue">Cotée</span> | Devis envoyé — en attente de réponse client. |
| `approved` | <span class="pill green">Approuvée</span> | Le client a accepté — prête à être répartie. |
| `assigned` | <span class="pill blue">Assignée</span> | Chauffeur assigné — récupération en attente. |
| `picking_up` · `arriving_at_pickup` · `arrived_at_pickup` | <span class="pill blue">Récupération</span> | Sous-états pendant la phase de récupération. |
| `picked_up` | <span class="pill blue">Récupérée</span> | Produits en main du chauffeur. |
| `in_transit` | <span class="pill blue">En transit</span> | En route vers la destination finale. |
| `arriving_at_drop_off` · `arrived_at_drop_off` | <span class="pill blue">Livraison</span> | Sous-états à l'arrivée à destination. |
| `waiting_confirmation` | <span class="pill amber">En attente de confirmation</span> | PIN ou preuve photographique manquant. |
| `completed` | <span class="pill green">Terminée</span> | Livrée — en attente de conciliation. |
| `canceled` | <span class="pill gray">Annulée</span> | Client ou admin a annulé avant la répartition. |
| `denied` | <span class="pill red">Rejetée</span> | L'admin a rejeté le devis. |
| `delivery_failed` | <span class="pill red">Livraison échouée</span> | Impossible de livrer (client absent, mauvaise adresse, etc.). |
| `returned_to_sender` | <span class="pill gray">Retournée</span> | Produits retournés à l'expéditeur. |

### États de paiement {#payment-states}
| Code | Étiquette | Signification |
| --- | --- | --- |
| `unpaid` | <span class="pill amber">Non payée</span> | Aucun paiement enregistré. |
| `paid` | <span class="pill green">Payée</span> | Encaissement complet reçu. |
| `surcharge_due` | <span class="pill amber">Surcharge en attente</span> | Après conciliation il reste un solde à percevoir. |
| `refunded` | <span class="pill gray">Remboursée</span> | Remboursement total exécuté. |

---

## Questions fréquentes {#faq}

### Le client veut modifier l'adresse de livraison après l'approbation — c'est possible ? {#faq-edit-address}
Oui, tant que la commande est à l'état <span class="pill green">Approuvée</span> ou <span class="pill blue">Assignée</span> et que le chauffeur n'a pas démarré la phase de récupération, les adresses sont modifiables. Une fois que la commande passe à <span class="pill blue">Récupérée</span>, les adresses sont verrouillées. Pour des changements ultérieurs, le bon réflexe est de créer une nouvelle commande.

### Que faire si un chauffeur signale un problème pendant la livraison ? {#faq-delivery-problem}
Le chauffeur peut marquer *Livraison échouée* depuis son application, ce qui déplace la commande vers <span class="pill red">Livraison échouée</span>. Cela l'amène dans l'onglet *Conflits* de Demande l'attention. Les options sont : réessayer la livraison (réassigner), retourner à l'expéditeur, ou marquer comme perte couverte par l'assurance.

### La répartition automatique a assigné le « mauvais » chauffeur — puis-je réaffecter ? {#faq-reassign-driver}
Oui. Depuis le détail de la commande, cliquez sur `Réaffecter` — vous verrez la liste des chauffeurs disponibles classée par faisabilité. Gardez à l'esprit que réaffecter peut empirer la densité globale des itinéraires ; l'algorithme optimise déjà par bin-packing.

### Quand sous-traite-t-on (outsourcing) ? {#faq-outsource-when}
Quand aucun chauffeur salarié n'est faisable pour la commande et que le client n'accepte pas d'étendre la fenêtre. C'est une décision coûteuse — elle réduit la marge car on paie le prestataire externe. À utiliser avec discernement.

### Le client a payé mais la commande est restée en « Surcharge en attente » — pourquoi ? {#faq-surcharge-pending}
Parce que la conciliation a détecté que le coût réel des produits était supérieur au devis initial. Le client a payé le devis original, mais il reste un delta. Notifiez-le pour percevoir la différence.

### Quelle est la différence entre annuler et rejeter une commande ? {#faq-cancel-vs-reject}
**Annuler** est pour les commandes déjà cotées ou approuvées que l'on abandonne (client ou admin). **Rejeter** est exclusif à l'étape de cotation — l'admin décide de ne pas la prendre (capacité insuffisante, hors zone, etc.).

### Comment se génèrent les PIN de livraison ? {#faq-pin-generation}
Automatiquement à la création de la commande — un code à 6 chiffres unique par commande. Il est montré au client dans son application et au chauffeur lors de la livraison. Il sert de vérification d'identité du destinataire.

### Puis-je créer une commande depuis le panneau sans que le client ne l'initie ? {#faq-admin-create}
Pas directement depuis le panneau. Les commandes naissent toujours du côté client (application mobile). Le panneau administre le cycle de vie — coter, répartir, concilier — mais n'expose pas de formulaire pour créer des commandes manuellement. Si un client appelle au téléphone, la pratique est de le guider pour qu'il la crée depuis son application ou de coordonner avec l'équipe technique pour utiliser l'endpoint API directement.
