# Fiche de présentation et questions/réponses - Projet EduTrack

## 1. Présentation rapide du projet

**EduTrack** est une application web Angular de gestion de cours en ligne.

Elle permet à plusieurs types d'utilisateurs d'interagir avec la plateforme :

- **ADMIN** : gère les utilisateurs, les cours, les catégories, les inscriptions et consulte les statistiques globales.
- **TEACHER** : crée et gère ses cours, consulte les étudiants inscrits et suit leur progression.
- **STUDENT** : consulte le catalogue, s'inscrit aux cours et suit sa progression.

Phrase courte à dire au début :

> EduTrack est une application Front-End Angular connectée à une API REST Spring Boot. Elle respecte une architecture modulaire, consomme des services back-end, gère l'authentification, les rôles, un CRUD complet sur les cours, des formulaires réactifs, des relations entre modèles et des dashboards interactifs.

## 2. Conformité avec l'énoncé du projet

| Exigence de l'énoncé | Réponse dans EduTrack |
|---|---|
| Application Front-End Angular | Front-end Angular dans `edutrack-frontend` |
| API REST back-end | API Spring Boot dans `edutrack-backend`, base URL configurée dans `environment.ts` |
| Architecture modulaire | Dossiers `core`, `shared`, `features`, `layouts`, `components` |
| Composants séparés | Dashboards, cours, catégories, inscriptions, utilisateurs, auth |
| Services Angular | `AuthService`, `CourseService`, `CategoryService`, `EnrollmentService`, `UserService`, `DashboardService` |
| CRUD complet | CRUD complet sur l'entité `Course` |
| Formulaires Angular | Formulaire réactif dans `CourseFormComponent` |
| Relation entre deux modèles | `Course -> Category`, `Course -> Teacher`, `Enrollment -> Student + Course` |
| Gestion des rôles | `ADMIN`, `TEACHER`, `STUDENT` |
| Routes protégées | `authGuard` et `roleGuard` |
| Dashboards | Dashboard admin, teacher et student avec charts et statistiques |
| Build fonctionnel | `npm run build` fonctionne |

## 3. Architecture Angular du projet

Structure principale :

```txt
src/app/
├── core/
│   ├── guards/
│   ├── models/
│   └── services/
├── shared/
│   ├── components/
│   └── material/
├── layouts/
├── components/
├── features/
│   ├── auth/
│   ├── courses/
│   ├── categories/
│   ├── enrollments/
│   ├── users/
│   └── dashboards/
├── interceptors/
├── app.routes.ts
└── app.config.ts
```

Explication simple :

> Le dossier `core` contient les éléments centraux utilisés dans toute l'application : services, modèles et guards. Le dossier `features` contient les fonctionnalités métier séparées : cours, catégories, inscriptions, utilisateurs et dashboards. Le dossier `shared` contient les composants ou modules réutilisables comme `MaterialModule` et `ConfirmDialogComponent`. Cette séparation rend le projet clair, maintenable et conforme aux bonnes pratiques Angular.

## 4. Pourquoi cette architecture est modulaire ?

Une architecture est modulaire quand chaque partie a une responsabilité claire :

- les **components** affichent les données et gèrent les actions de l'utilisateur ;
- les **services** communiquent avec l'API REST ;
- les **models** typent les données échangées ;
- les **guards** protègent les routes ;
- les **interceptors** ajoutent automatiquement le token JWT aux requêtes ;
- les **features** regroupent les fonctionnalités métier.

Réponse courte :

> J'ai séparé l'application en couches : affichage, logique métier côté front, modèles, sécurité et communication API. Cela évite de mélanger le HTML, les appels HTTP et la gestion des rôles dans un seul fichier.

## 5. Modèles TypeScript importants

### Course

Le modèle `Course` représente un cours.

Il contient :

- `title`
- `description`
- `price`
- `level`
- `durationHours`
- `imageUrl`
- `categoryId`
- `teacherId`
- `categoryName`
- `teacherName`
- `enrollmentsCount`
- `averageProgress`

Exemple réel :

```ts
export interface CourseRequest {
  title: string;
  description: string;
  price: number;
  level: CourseLevel;
  durationHours: number;
  imageUrl?: string | null;
  categoryId: number;
  teacherId: number;
}
```

Explication :

> `CourseRequest` est utilisé pour ajouter ou modifier un cours. `CourseResponse` est utilisé pour afficher un cours reçu depuis l'API avec des informations supplémentaires comme le nom de la catégorie, le nom de l'enseignant et le nombre d'inscriptions.

### Enrollment

Le modèle `Enrollment` représente l'inscription d'un étudiant à un cours.

Il montre la relation :

```txt
Enrollment -> Student + Course
```

Exemple :

```ts
export interface EnrollmentResponse {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  courseId: number;
  courseTitle: string;
  teacherName: string;
  progress: number;
  certificateIssued: boolean;
  enrolledAt: string;
}
```

## 6. Services Angular et API REST

Les services Angular utilisent `HttpClient` et retournent des `Observable`.

Exemple avec `CourseService` :

```ts
getCourses(): Observable<CourseResponse[]> {
  return this.http.get<CourseResponse[]>(this.base);
}

getCourseById(id: number): Observable<CourseResponse> {
  return this.http.get<CourseResponse>(`${this.base}/${id}`);
}

createCourse(request: CourseRequest): Observable<CourseResponse> {
  return this.http.post<CourseResponse>(this.base, request);
}

updateCourse(id: number, request: CourseRequest): Observable<CourseResponse> {
  return this.http.put<CourseResponse>(`${this.base}/${id}`, request);
}

deleteCourse(id: number): Observable<void> {
  return this.http.delete<void>(`${this.base}/${id}`);
}
```

Question possible :

**Pourquoi utiliser un service Angular ?**

Réponse :

> Le service sépare la communication avec l'API REST de la partie affichage. Le composant ne connaît pas les détails des URLs, il appelle simplement des méthodes comme `getCourses`, `createCourse` ou `deleteCourse`. Cela rend le code plus propre et réutilisable.

Question possible :

**Pourquoi les méthodes retournent des Observable ?**

Réponse :

> Les appels HTTP sont asynchrones. Angular utilise les `Observable` pour recevoir la réponse plus tard, gérer le succès, l'erreur, et réagir aux données avec `subscribe`.

## 7. CRUD complet sur Course

Le CRUD principal du projet concerne l'entité `Course`.

| Action CRUD | Composant | Service |
|---|---|---|
| Create | `CourseFormComponent` | `CourseService.createCourse()` |
| Read list | `CourseListComponent` | `CourseService.getCourses()` |
| Read detail | `CourseDetailsComponent` | `CourseService.getCourseById()` |
| Update | `CourseFormComponent` | `CourseService.updateCourse()` |
| Delete | `CourseListComponent` | `CourseService.deleteCourse()` |

Réponse courte :

> Le CRUD est complet car l'utilisateur autorisé peut ajouter, consulter, modifier et supprimer un cours. Le même formulaire est réutilisé pour l'ajout et la modification.

## 8. Formulaire réactif Angular

Le formulaire du cours utilise `ReactiveFormsModule`, `FormBuilder` et des validateurs.

Champs présents :

- titre ;
- description ;
- prix ;
- niveau ;
- durée ;
- image ;
- catégorie ;
- enseignant.

Exemple :

```ts
courseForm = this.fb.group({
  title: ['', [Validators.required, Validators.maxLength(120)]],
  description: ['', [Validators.required, Validators.maxLength(1000)]],
  price: [0, [Validators.required, Validators.min(0)]],
  level: ['INTERMEDIATE', Validators.required],
  durationHours: [10, [Validators.required, Validators.min(1)]],
  imageUrl: ['', Validators.maxLength(500)],
  categoryId: [null as number | null, Validators.required],
  teacherId: [this.currentUserId, Validators.required],
});
```

Question possible :

**Pourquoi utiliser un formulaire réactif au lieu d'un simple formulaire HTML ?**

Réponse :

> Un formulaire réactif permet de gérer les validations côté TypeScript, de contrôler l'état du formulaire, de désactiver un champ selon le rôle, et de préparer proprement les données avant l'envoi vers l'API.

## 9. Relations entre modèles

L'énoncé demande une relation entre deux tables ou modèles.

Dans EduTrack, il y en a plusieurs :

```txt
Course -> Category
Course -> Teacher
Enrollment -> Student + Course
```

Exemples visibles dans l'interface :

- dans la liste des cours, on affiche la catégorie et l'enseignant ;
- dans le détail d'un cours, on affiche l'enseignant responsable ;
- dans la gestion des inscriptions, on affiche l'étudiant, le cours et la progression ;
- dans les dashboards, on affiche les cours par catégorie et les inscriptions par cours.

Réponse courte :

> La relation n'est pas seulement dans le back-end. Elle est aussi visible dans le front grâce aux modèles TypeScript et aux tableaux qui affichent les informations liées.

## 10. Authentification et rôles

EduTrack gère trois rôles :

- `ADMIN`
- `TEACHER`
- `STUDENT`

Le service `AuthService` :

- appelle `/auth/login` ;
- stocke `accessToken`, `refreshToken`, `role`, `email`, `userId` ;
- expose des méthodes comme `isLoggedIn()`, `getRole()`, `isAdmin()`.

Question possible :

**Comment l'application sait si l'utilisateur est connecté ?**

Réponse :

> Après le login, le back-end retourne un JWT. Le front le stocke dans `localStorage`. Ensuite, `AuthService.isLoggedIn()` vérifie si le token existe.

Question possible :

**Comment le rôle est utilisé dans le front ?**

Réponse :

> Le rôle est stocké après la connexion. Il est utilisé dans la navbar, dans les guards et dans les composants pour afficher ou masquer certaines actions comme ajouter un cours, modifier un cours ou gérer les utilisateurs.

## 11. Guards et routes protégées

Le projet utilise :

- `authGuard` : vérifie que l'utilisateur est connecté ;
- `roleGuard` : vérifie que l'utilisateur possède le rôle autorisé.

Exemple de route protégée :

```ts
{
  path: 'courses/add',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['ADMIN', 'TEACHER'] },
  loadComponent: () => import('./features/courses/course-form/course-form.component')
    .then(m => m.CourseFormComponent),
}
```

Question possible :

**Quelle est la différence entre AuthGuard et RoleGuard ?**

Réponse :

> `AuthGuard` vérifie si l'utilisateur est connecté. `RoleGuard` vérifie s'il a le bon rôle pour accéder à une page. Par exemple, un étudiant connecté ne doit pas accéder à la gestion des utilisateurs.

## 12. Interceptor JWT

L'interceptor ajoute automatiquement le token dans les requêtes HTTP :

```txt
Authorization: Bearer token
```

Il permet aussi de gérer les erreurs :

- `401` : token expiré ou utilisateur non authentifié ;
- `403` : accès refusé.

Question possible :

**Pourquoi utiliser un interceptor ?**

Réponse :

> Sans interceptor, il faudrait ajouter manuellement le token dans chaque service. L'interceptor centralise ce comportement et rend les services plus simples.

## 13. Dashboards et charts

L'application contient trois dashboards :

### Admin Dashboard

Affiche :

- total utilisateurs ;
- total enseignants ;
- total étudiants ;
- total cours ;
- total catégories ;
- total inscriptions ;
- progression moyenne ;
- meilleurs cours ;
- dernières inscriptions ;
- répartition des rôles ;
- évolution des inscriptions.

### Teacher Dashboard

Affiche :

- mes cours ;
- mes étudiants ;
- progression moyenne ;
- inscriptions par cours ;
- statut des étudiants ;
- activité récente.

### Student Dashboard

Affiche :

- mes cours suivis ;
- progression ;
- certificats ;
- cours recommandés ;
- progression par cours.

Question possible :

**Quelle librairie est utilisée pour les graphiques ?**

Réponse :

> Le projet utilise `Chart.js` avec `ng2-charts`, ce qui correspond à ce qui est demandé dans le cours pour afficher des courbes et des statistiques.

Question possible :

**Pourquoi les dashboards sont importants dans l'énoncé ?**

Réponse :

> L'énoncé demande la visualisation des données. Les dashboards transforment les données de l'API en indicateurs lisibles : nombres, tableaux, courbes et barres de progression.

## 14. Front-End et ergonomie

Le projet met en valeur le front Angular avec :

- Angular Material ;
- Tailwind CSS ;
- cartes statistiques ;
- tableaux responsives ;
- badges de statut ;
- progress bars ;
- états de chargement ;
- états vides ;
- états d'erreur ;
- navbar dynamique selon le rôle ;
- interface responsive.

Réponse courte :

> Comme c'est une matière Angular, j'ai travaillé non seulement les fonctionnalités, mais aussi l'ergonomie : composants séparés, interface claire, feedback utilisateur, responsive design et dashboards interactifs.

## 15. Questions probables du professeur

### Question 1 : Quelle est l'idée du projet ?

Réponse :

> EduTrack est une plateforme de gestion de cours en ligne. Elle permet à un administrateur de gérer la plateforme, à un enseignant de gérer ses cours et à un étudiant de s'inscrire et suivre sa progression.

### Question 2 : Quelle est l'entité utilisée pour le CRUD complet ?

Réponse :

> L'entité principale du CRUD est `Course`. On peut ajouter, afficher, modifier, supprimer et consulter le détail d'un cours.

### Question 3 : Où se trouve la consommation d'API REST ?

Réponse :

> Elle se trouve dans les services Angular du dossier `core/services`, par exemple `CourseService`, `AuthService`, `CategoryService`, `EnrollmentService` et `DashboardService`.

### Question 4 : Donnez un exemple d'appel API.

Réponse :

```ts
return this.http.get<CourseResponse[]>(this.base);
```

Explication :

> Cette instruction appelle l'API REST pour récupérer la liste des cours et retourne un `Observable<CourseResponse[]>`.

### Question 5 : Comment le front communique-t-il avec le back-end ?

Réponse :

> Le front utilise `HttpClient`. Les services appellent les endpoints REST du back-end Spring Boot. Les réponses sont typées avec des interfaces TypeScript.

### Question 6 : Où sont les modèles ?

Réponse :

> Les modèles sont dans `src/app/core/models`. Ils décrivent les objets manipulés côté front : `Course`, `Category`, `User`, `Enrollment`, `Dashboard`.

### Question 7 : Pourquoi créer des interfaces TypeScript ?

Réponse :

> Les interfaces permettent de typer les données, d'éviter les erreurs de propriétés, et de rendre le code plus lisible.

### Question 8 : Comment la relation Course-Category est visible ?

Réponse :

> Dans le modèle `CourseResponse`, on a `categoryId`, `categoryName` et parfois l'objet `category`. Dans l'interface, la liste et le détail des cours affichent la catégorie du cours.

### Question 9 : Comment la relation Enrollment-Student-Course est visible ?

Réponse :

> Dans la gestion des inscriptions, chaque ligne affiche le nom de l'étudiant, son email, le cours, l'enseignant, la progression et le certificat.

### Question 10 : Comment fonctionne la protection des routes ?

Réponse :

> Les routes sensibles utilisent `canActivate`. `authGuard` vérifie la connexion et `roleGuard` vérifie les rôles autorisés indiqués dans `data.roles`.

### Question 11 : Exemple de route réservée à l'admin ?

Réponse :

```ts
{
  path: 'users',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['ADMIN'] },
}
```

### Question 12 : Comment empêcher un étudiant d'ajouter un cours ?

Réponse :

> La route `courses/add` est protégée par `roleGuard` avec les rôles `ADMIN` et `TEACHER`. Donc un `STUDENT` est redirigé vers la page d'accès refusé.

### Question 13 : Comment le formulaire Course est validé ?

Réponse :

> Le formulaire utilise `Validators.required`, `Validators.maxLength` et `Validators.min`. Si le formulaire est invalide, on appelle `markAllAsTouched()` et l'envoi est bloqué.

### Question 14 : Pourquoi utiliser `getRawValue()` dans le formulaire ?

Réponse :

> Parce que certains champs peuvent être désactivés selon le rôle, par exemple `teacherId` pour un enseignant. `getRawValue()` permet de récupérer aussi les valeurs des champs désactivés.

### Question 15 : Pourquoi utiliser `subscribe()` ?

Réponse :

> Les méthodes HTTP retournent des `Observable`. `subscribe()` permet d'exécuter l'appel, récupérer la réponse, traiter l'erreur et mettre à jour l'interface.

### Question 16 : Quelle est la différence entre `CourseRequest` et `CourseResponse` ?

Réponse :

> `CourseRequest` correspond aux données envoyées au back-end lors de l'ajout ou la modification. `CourseResponse` correspond aux données reçues du back-end, avec des informations supplémentaires comme `id`, `categoryName`, `teacherName`, `enrollmentsCount`.

### Question 17 : Pourquoi avoir un dossier `shared` ?

Réponse :

> `shared` contient les éléments réutilisables dans plusieurs parties du projet, par exemple `MaterialModule` et `ConfirmDialogComponent`.

### Question 18 : Pourquoi avoir un dossier `core` ?

Réponse :

> `core` regroupe les services, modèles et guards utilisés globalement. Ce sont les éléments centraux de l'application.

### Question 19 : Le projet utilise-t-il des modules Angular ?

Réponse :

> Le projet utilise surtout des composants standalone, une pratique Angular moderne. Pour mutualiser Angular Material, il utilise aussi un `MaterialModule` partagé.

### Question 20 : Quelle commande permet de vérifier que le front compile ?

Réponse :

```bash
npm run build
```

### Question 21 : Quelle commande permet de lancer le front ?

Réponse :

```bash
npm install
npm run dev
```

ou selon l'environnement :

```bash
ng serve
```

### Question 22 : Quelle commande permet de lancer le back-end ?

Réponse :

```bash
mvnw.cmd spring-boot:run
```

### Question 23 : Quels comptes utiliser pour la démonstration ?

Réponse :

```txt
Admin   : admin@edutrack.com / Admin123
Teacher : teacher@edutrack.com / Teacher123
Student : student@edutrack.com / Student123
```

### Question 24 : Quelle est la valeur ajoutée du projet ?

Réponse :

> Le projet ne se limite pas à un mini CRUD. Il contient une vraie séparation des rôles, plusieurs dashboards, des relations métier visibles, une API REST, des formulaires réactifs et une interface moderne.

### Question 25 : Si le professeur demande "montrez-moi le CRUD"

Réponse à faire en démo :

1. Se connecter comme admin ou teacher.
2. Aller dans `Cours`.
3. Cliquer sur `Nouveau cours`.
4. Remplir le formulaire.
5. Enregistrer.
6. Revenir à la liste.
7. Ouvrir le détail.
8. Modifier le cours.
9. Supprimer le cours.

### Question 26 : Si le professeur demande "montrez-moi les rôles"

Réponse à faire en démo :

1. Se connecter comme admin.
2. Montrer le dashboard admin et la gestion utilisateurs.
3. Se connecter comme teacher.
4. Montrer le dashboard enseignant et l'ajout de cours.
5. Se connecter comme student.
6. Montrer l'inscription aux cours et le dashboard étudiant.

### Question 27 : Si le professeur demande "montrez-moi la relation entre deux modèles"

Réponse à faire en démo :

1. Ouvrir la liste des cours.
2. Montrer que chaque cours affiche sa catégorie et son enseignant.
3. Ouvrir la gestion des inscriptions.
4. Montrer que chaque inscription relie un étudiant à un cours.

### Question 28 : Si le professeur demande "où sont les dashboards ?"

Réponse :

> Les dashboards sont dans `src/app/features/dashboards`. Chaque rôle possède son dashboard : admin, teacher et student. Ils consomment les données via `DashboardService`.

### Question 29 : Si le professeur demande "pourquoi Angular Material ?"

Réponse :

> Angular Material fournit des composants UI prêts, accessibles et cohérents : boutons, cards, tables, dialogs, icons et progress bars. Cela aide à construire une interface propre et professionnelle.

### Question 30 : Si le professeur demande "pourquoi Chart.js ?"

Réponse :

> Chart.js avec `ng2-charts` permet de transformer les données métiers en graphiques. C'est utilisé pour les statistiques des dashboards.

## 16. Réponses rapides aux notions du corrigé d'examen

### AngularJS correspond à quelle version ?

Réponse :

> AngularJS correspond à Angular version 1. Angular 2+ est une réécriture moderne basée sur TypeScript.

### Est-ce qu'un service Angular crée une nouvelle instance à chaque injection ?

Réponse :

> Non, si le service est déclaré avec `providedIn: 'root'`, Angular crée généralement une seule instance partagée dans toute l'application.

### Que charge Angular au démarrage ?

Réponse :

> Angular démarre l'application à partir du composant racine et de la configuration principale. Dans ce projet, l'application utilise une configuration moderne avec `app.config.ts`, `app.routes.ts` et des composants standalone.

### Quel module utiliser pour les courbes Chart.js dans Angular ?

Réponse :

> On utilise `ng2-charts` avec `Chart.js`.

### Comment créer une méthode de service REST ?

Réponse :

```ts
getAllCourses(): Observable<CourseResponse[]> {
  return this.http.get<CourseResponse[]>(this.base);
}
```

### Comment rediriger après une opération ?

Réponse :

```ts
this.router.navigate(['/courses/details', course.id]);
```

## 17. Scénario de démonstration conseillé

Ordre conseillé pour la présentation :

1. Présenter brièvement EduTrack.
2. Montrer l'architecture du projet dans `src/app`.
3. Montrer les modèles dans `core/models`.
4. Montrer les services dans `core/services`.
5. Montrer les routes protégées dans `app.routes.ts`.
6. Lancer l'application.
7. Se connecter comme admin.
8. Montrer dashboard admin.
9. Montrer la gestion des cours.
10. Ajouter ou modifier un cours.
11. Montrer la relation cours-catégorie-enseignant.
12. Montrer la gestion des inscriptions.
13. Se connecter comme student.
14. Montrer inscription au cours et dashboard étudiant.
15. Conclure avec le build fonctionnel.

## 18. Conclusion à dire

> Pour conclure, EduTrack respecte les objectifs de l'énoncé : une application Angular modulaire, connectée à une API REST, avec services, modèles, guards, gestion des rôles, CRUD complet, formulaires réactifs, relations entre modèles et dashboards interactifs. Le projet met aussi l'accent sur le front-end avec une interface moderne, responsive et adaptée à chaque rôle.

