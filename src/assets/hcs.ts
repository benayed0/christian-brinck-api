export const HCS = {
  H1: {
    A: {
      summary:
        'Le clinicien montre un niveau variable de familiarité avec l’historique du patient, allant d’une référence précise aux informations passées à une dépendance fréquente au dossier, ou même une absence de lien avec l’historique lors de la visite.',
      variables: {
        '1': "Le clinicien indique une familiarité claire avec l'historique/dossier du patient (par exemple, mentionne des tests récents effectués ou des informations de visite basées sur des notes de dossier précédentes)",
        '3': 'Le clinicien fait référence aux visites ou antécédents passés, mais sa familiarité avec ceux-ci ne semble pas solide',
        '5': "Le clinicien doit se référer continuellement au dossier pour se familiariser avec le cas ou ne relie pas la visite actuelle à l'historique ou au dossier du patient (ou n'a même pas le dossier).",
      },
    },
    B: {
      summary:
        'Le patient reçoit un accueil allant de personnel et chaleureux à sommaire et impersonnel, avec une reconnaissance variable de son identité et de ses préférences.',
      variables: {
        '1': 'Le patient est accueilli de manière personnelle et chaleureuse (par exemple, le clinicien demande au patient comment il/elle préfère être appelé(e), utilise le nom du patient)',
        '3': "Le patient est accueilli d'une manière qui reconnaît le patient, mais sans grande chaleur ou personnalisation",
        '5': "L'accueil du patient est sommaire, impersonnel ou inexistant",
      },
    },
    C: {
      summary:
        'Le clinicien adopte une approche variée pour mettre le patient à l’aise, allant de commentaires non médicaux pour instaurer une ambiance détendue à une absence totale de conversation légère ou un intérêt bref et ponctuel.',
      variables: {
        '1': "Le clinicien fait des commentaires non médicaux, les utilisant pour mettre le patient à l'aise",
        '3': 'Le clinicien fait une tentative sommaire de conversation légère (ne montre pas un grand intérêt, garde la discussion brève avant de passer à autre chose)',
        '5': "Le clinicien va directement au but sans aucune tentative de conversation légère (ou interrompt le patient de manière abrupte, ou plus tard dans la visite, ne montre qu'un intérêt passager)",
      },
    },
    D: {
      summary:
        ' Le clinicien explore le(s) problème(s) du patient avec une approche allant de questions ouvertes favorisant l’expression libre à des questions fermées et saccadées limitant le récit spontané.',
      variables: {
        '1': "Le clinicien tente d'identifier le(s) problème(s) en utilisant principalement des questions ouvertes (pose des questions de manière à permettre au patient de raconter sa propre histoire avec un minimum d'interruptions ou de questions fermées)",
        '3': "Le clinicien tente d'identifier le(s) problème(s) en utilisant une combinaison de questions ouvertes et fermées (commence peut-être par des questions ouvertes mais revient rapidement à des questions fermées)",
        '5': "Le clinicien tente d'identifier le(s) problème(s) en utilisant principalement des questions fermées (style saccadé)",
      },
    },
    E: {
      summary:
        'Le clinicien manifeste un intérêt variable pour les préoccupations du patient, allant d’un encouragement actif à une écoute passive, voire à une interruption qui limite le développement des idées.',
      variables: {
        '1': 'Le clinicien encourage le patient à développer ses préoccupations (par exemple, en utilisant divers encourageants tels que "Ah bon", "Dites-m\'en plus", "Continuez").',
        '3': "Le clinicien n'interrompt pas le patient mais n'exprime pas un grand intérêt à en apprendre davantage (écoute, mais n'encourage pas à développer ou à poursuivre la discussion)",
        '5': "Le clinicien interrompt ou coupe le patient dans sa tentative de développer (n'est clairement pas très intéressé).",
      },
    },
    F: {
      summary:
        'Le clinicien explore la totalité des préoccupations du patient avec une approche variant de l’établissement d’un agenda dès le début de la visite à la focalisation immédiate sur la première plainte sans recherche d’autres préoccupations.',
      variables: {
        '1': 'Le clinicien tente de déterminer toute la gamme des préoccupations du patient en établissant un agenda tôt dans la visite (le clinicien fait autre chose que simplement poursuivre la première plainte exprimée)',
        '3': "Le clinicien fait référence à d'autres plaintes possibles, ou les aborde brièvement avant de poursuivre la première plainte du patient, ou établit un agenda au fur et à mesure de la visite",
        '5': "Le clinicien poursuit immédiatement la première préoccupation du patient sans tenter de découvrir d'autres préoccupations possibles",
      },
    },
  },
  H2: {
    A: {
      summary:
        'Le clinicien manifeste un intérêt pour la compréhension du patient, allant d’une exploration approfondie de sa perception du problème à une absence totale d’attention pour son point de vue.',
      variables: {
        '1': 'Le clinicien montre un grand intérêt à explorer la compréhension du patient du problème (par exemple, demande au patient ce que les symptômes signifient pour lui/elle).',
        '3': 'Le clinicien montre un intérêt bref ou superficiel pour comprendre la perception du patient du problème',
        '5': 'Le clinicien ne fait aucune tentative/ne montre aucun intérêt à comprendre la perspective du patient',
      },
    },
    B: {
      summary:
        'Le clinicien s’intéresse aux attentes du patient avec une approche allant d’une exploration attentive de ses souhaits à une absence totale de considération pour ce qu’il espère obtenir de la visite.',
      variables: {
        '1': 'Le clinicien demande (ou répond avec intérêt) ce que le patient espère obtenir de la visite (par exemple, attentes générales ou demandes spécifiques comme des médicaments, des références).',
        '3': "Le clinicien montre de l'intérêt pour avoir une brève idée de ce que le patient espère obtenir de la visite, mais passe rapidement à autre chose.",
        '5': 'Le clinicien ne fait aucune tentative pour déterminer (ne montre aucun intérêt pour) ce que le patient espère obtenir de la visite.',
      },
    },
    C: {
      summary:
        'Le clinicien manifeste un intérêt variable pour l’impact du problème sur le mode de vie du patient, allant d’une exploration détaillée à une absence totale de considération pour ses effets sur la vie quotidienne.',
      variables: {
        '1': 'Le clinicien tente de déterminer en détail/montre un grand intérêt pour la façon dont le problème affecte le mode de vie du patient (travail, famille, activités quotidiennes).',
        '3': 'Le clinicien tente de déterminer brièvement/montre seulement un certain intérêt pour la façon dont le problème affecte le mode de vie du patient.',
        '5': 'Le clinicien ne fait aucune tentative pour déterminer/ne montre aucun intérêt pour la façon dont le problème affecte le mode de vie du patient.',
      },
    },
  },
  H3: {
    A: {
      summary:
        'Le clinicien manifeste une ouverture variable à l’expression des émotions du patient, allant d’un encouragement explicite à une absence d’intérêt, voire un découragement de toute manifestation émotionnelle.',
      variables: {
        '1': "Le clinicien encourage ouvertement/est réceptif à l'expression des émotions (par exemple, par l'utilisation de continuateurs ou de pauses appropriées, signalant verbalement ou non verbalement qu'il est acceptable d'exprimer ses sentiments)",
        '3': "Le clinicien montre relativement peu d'intérêt ou d'encouragement pour l'expression des émotions du patient; ou permet que les émotions soient exprimées mais encourage activement ou subtilement le patient à passer à autre chose",
        '5': "Le clinicien ne montre aucun intérêt pour l'état émotionnel du patient et/ou décourage ou interrompt l'expression des émotions par le patient (signale verbalement ou non verbalement qu'il n'est pas acceptable d'exprimer des émotions)",
      },
    },
    B: {
      summary:
        'Le clinicien manifeste un degré variable d’acceptation des sentiments du patient, allant d’une validation explicite à une absence totale de reconnaissance, voire une minimisation ou remise en question des émotions.',
      variables: {
        '1': 'Le clinicien fait des commentaires indiquant clairement l\'acceptation/la validation des sentiments du patient (par exemple, "Je ressentirais la même chose...", "Je peux voir comment cela vous inquiète...")',
        '3': "Le clinicien reconnaît brièvement les sentiments du patient mais ne fait aucun effort pour indiquer l'acceptation/la validation",
        '5': 'Le clinicien ne fait aucune tentative pour répondre/valider les sentiments du patient, ou peut-être les minimise ou les remet en question (par exemple, "C\'est ridicule d\'être si préoccupé par...")',
      },
    },
    C: {
      summary:
        'Le clinicien manifeste un intérêt variable pour explorer les sentiments du patient, allant d’une identification explicite à une absence totale de tentative pour les reconnaître.',
      variables: {
        '1': 'Le clinicien fait une tentative claire d\'explorer les sentiments du patient en les identifiant ou les nommant (par exemple, "Alors, comment cela vous fait-il vous sentir?", "Il me semble que vous vous sentez assez anxieux à propos de...")',
        '3': 'Le clinicien fait une brève référence aux sentiments du patient, mais fait peu pour les explorer en les identifiant ou les nommant',
        '5': 'Le clinicien ne fait aucune tentative pour identifier les sentiments du patient',
      },
    },
    D: {
      summary:
        'Le clinicien manifeste un intérêt variable par des comportements non verbaux, allant d’une expression claire d’engagement et de connexion à un manque d’intérêt marqué, avec des signaux non verbaux absents ou inappropriés.',
      variables: {
        '1': 'Le clinicien affiche des comportements non verbaux qui expriment un grand intérêt, une préoccupation et une connexion (par exemple, contact visuel, ton de voix et orientation du corps) tout au long de la visite.',
        '3': 'Le comportement non verbal du clinicien ne montre ni grand intérêt ni désintérêt (ou les comportements au cours de la visite sont incohérents).',
        '5': "Le comportement non verbal du clinicien affiche un manque d'intérêt et/ou de préoccupation et/ou de connexion (par exemple, peu ou pas de contact visuel, orientation du corps ou utilisation de l'espace inappropriées, voix monotone)",
      },
    },
  },
  H4: {
    A: {
      summary:
        'Le clinicien présente les informations diagnostiques en tenant compte des préoccupations du patient, allant d’une intégration complète de son point de vue à une communication centrée uniquement sur le cadre de référence médical.',
      variables: {
        '1': 'Le clinicien présente les informations diagnostiques et autres informations pertinentes de manière à refléter la présentation initiale des préoccupations du patient',
        '3': 'Le clinicien fait une tentative sommaire pour présenter le diagnostic et les informations en termes des préoccupations du patient',
        '5': "Le clinicien présente le diagnostic et les informations en termes qui correspondent au cadre de référence du médecin plutôt qu'en incorporant ceux du patient",
      },
    },
    B: {
      summary:
        'Le clinicien laisse un temps de réaction au patient après avoir donné des informations, allant d’une pause attentive permettant l’assimilation à une absence de pause qui empêche une pleine compréhension.',
      variables: {
        '1': 'Le clinicien fait une pause après avoir donné des informations afin de permettre au patient de réagir et de les assimiler',
        '3': "Le clinicien fait une brève pause pour la réaction du patient, mais passe ensuite rapidement à autre chose (laissant l'impression que le patient n'a peut-être pas entièrement assimilé les informations).",
        '5': "Le clinicien donne des informations et continue rapidement sans donner au patient l'occasion de réagir (l'impression est que ces informations ne seront pas mémorisées correctement ou pleinement appréciées par le patient)",
      },
    },
    C: {
      summary:
        'Le clinicien transmet les informations avec une clarté variable, allant d’une communication simple sans jargon à une explication trop technique, rendant la compréhension difficile pour le patient.',
      variables: {
        '1': "Les informations sont énoncées clairement et avec peu ou pas d'utilisation de jargon",
        '3': 'Les informations contiennent du jargon et sont quelque peu difficiles à comprendre',
        '5': 'Les informations sont énoncées de manière technique ou trop complexe (indiquant que le patient ne les a probablement pas comprises pleinement ou correctement).',
      },
    },
    D: {
      summary:
        'Le clinicien fournit des explications de façon variable sur les raisons des tests et traitements, allant d’une justification complète et claire à une absence totale d’explication.',
      variables: {
        '1': 'Le clinicien explique pleinement/clairement la raison des tests et traitements actuels, passés ou futurs afin que le patient puisse comprendre leur importance pour le diagnostic et le traitement',
        '3': 'Le clinicien explique brièvement la raison des tests et traitements',
        '5': 'Le clinicien propose/ordonne des tests et traitements, donnant peu ou pas de raison pour ceux-ci',
      },
    },
    E: {
      summary:
        'Le clinicien vérifie la compréhension du patient de manière variable, allant d’une vérification efficace à une absence totale de suivi sur la compréhension.',
      variables: {
        '1': 'Le clinicien vérifie efficacement la compréhension du patient',
        '3': 'Le clinicien vérifie brièvement ou inefficacement la compréhension du patient',
        '5': 'Le clinicien ne fait aucun effort pour déterminer si le patient a compris ce qui a été dit',
      },
    },
    F: {
      summary:
        'Le clinicien manifeste une ouverture variable à la participation du patient dans le processus de décision, allant d’un encouragement clair à un manque d’intérêt, voire un découragement actif.',
      variables: {
        '1': 'Le clinicien encourage clairement et invite la participation du patient dans le processus de prise de décision',
        '3': "Le clinicien montre peu d'intérêt à inviter l'implication du patient dans le processus de prise de décision, ou répond aux tentatives du patient d'être impliqué avec relativement peu d'enthousiasme",
        '5': 'Le prestataire ne montre aucun intérêt à impliquer le patient ou décourage/ignore activement les efforts du patient pour faire partie du processus de prise de décision',
      },
    },
    G: {
      summary:
        'Le clinicien manifeste un intérêt variable pour l’acceptabilité du plan de traitement, allant d’une volonté de négociation à une absence de recherche de l’adhésion du patient.',
      variables: {
        '1': "Le clinicien explore l'acceptabilité du plan de traitement, exprimant sa volonté de négocier si nécessaire",
        '3': "Le clinicien fait une brève tentative pour déterminer l'acceptabilité du plan de traitement, puis passe rapidement à autre chose",
        '5': "Le clinicien offre des recommandations pour le traitement avec peu ou pas de tentatives pour obtenir l'acceptation du patient (volonté ou probabilité de suivre le plan)",
      },
    },
    H: {
      summary:
        'Le clinicien manifeste un intérêt variable pour les obstacles à la mise en œuvre du plan de traitement, allant d’une exploration complète à une absence totale de considération pour d’éventuels obstacles.',
      variables: {
        '1': 'Le clinicien explore pleinement les obstacles à la mise en œuvre du plan de traitement',
        '3': 'Le clinicien explore brièvement les obstacles à la mise en œuvre du plan de traitement',
        '5': "Le clinicien n'aborde pas la question de savoir si des obstacles existent pour la mise en œuvre du plan de traitement",
      },
    },
    I: {
      summary:
        'Le clinicien manifeste une ouverture variable aux questions supplémentaires du patient, allant d’un encouragement actif à une absence totale de sollicitation, voire une ignorance des questions posées.',
      variables: {
        '1': 'Le clinicien encourage ouvertement et demande des questions supplémentaires de la part du patient (et y répond avec au moins un certain détail)',
        '3': "Le clinicien permet des questions supplémentaires de la part du patient, mais n'encourage pas la pose de questions ni n'y répond en détail",
        '5': 'Le clinicien ne fait aucune tentative pour solliciter des questions supplémentaires du patient ou les ignore largement si elles sont posées sans sollicitation',
      },
    },
    J: {
      summary:
        'Le clinicien élabore des plans de suivi de manière variable, allant d’une planification claire et spécifique à une absence totale de référence au suivi.',
      variables: {
        '1': 'Le clinicien établit des plans clairs et spécifiques pour le suivi de la visite',
        '3': 'Le clinicien fait référence au suivi, mais ne fait pas de plans spécifiques',
        '5': 'Le clinicien ne fait aucune référence aux plans de suivi',
      },
    },
  },
};
