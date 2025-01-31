---
date: 2022-10-31
type: 'page'
---

# Parliament Methods

Parliament is accessible via the URL `/parliament`.

The list of methods below represents changes and additions to the methods that all [Modules](/api/Modules) share.

## view_laws (session_id, body_id )

While still usable, replaced by a body call instead of via the station. See Body for details.

### session_id

A session id.

### body_id

The unique id of the space station.

## view_propositions (session_id, building_id )

Returns a list of the pending propositions.

```json
    {
       "status" : { /* ... */ },
       "propositions" : [
           {
              "id" : "id-goes-here",
              "name" : "Rename Station",
              "description" : "Rename the station from 'Bri Prui 7' to 'Deep Space 1'.",
              "votes_needed" : 7,
              "votes_yes" : 1,
              "votes_no" : 0,
              "status" : "Pending",
              "date_ends" : "01 31 2010 13:09:05 +0600",
              "proposed_by" : {
                   "id" : "id-goes-here",
                   "name" : "Klingons",
              },
              "my_vote" : 0 # not present if they haven't voted
           },
           /* ... */
       ]
    }
```

### session_id

A session id.

### building_id

The unique id of the parliament.

## view_taxes_collected (session_id, building_id )

Returns a list of the empires that have paid taxes and how much has been paid for the past seven days.

Within the taxes_collected list you will find the id and name of the empire that paid taxes, a list of payments for today (element 0) and the previous six days as well as the total of those seven days payments.

```json
{
  "status": {
    /* ... */
  },
  "taxes_collected": [
    {
      "id": "id-goes-here",
      "name": "Klingons",
      "paid": [0, 1000, 0, 0, 1500, 500, 500],
      "total": 3500
    }
    /* ... */
  ]
}
```

### session_id

A session id.

### building_id

The unique id of the parliament.

## get_stars_in_jurisdiction (session_id, building_id )

Returns a list of the stars in the jurisdiction of this space station.

```json
{
  "status": {
    /* ... */
  },
  "stars": [
    {
      "name": "Sol",
      "color": "yellow",
      "x": -41,
      "y": 27,
      "station": {
        // only shows up if this star is under the influence of a space station
        "id": "id-goes-here",
        "x": 143,
        "y": -27,
        "name": "The Death Star"
      }
    }
    /* ... */
  ]
}
```

### session_id

A session id.

### building_id

The unique id of the parliament.

## get_bodies_for_star_in_jurisdiction (session_id, building_id, star_id )

Returns a list of the bodies for a star in the jurisdiction of the space station.

```json
    {
       "status" : { /* ... */ },
       "bodies" : [
           {
               same data as get_status() on /body
           },
           /* ... */
       ]
    }
```

### session_id

A session id.

### building_id

The unique id of the parliament.

### star_id

The unique id of a star in jurisdiction. See c&lt;get_stars_in_jurisdiction>.

## get_mining_platforms_for_asteroid_in_jurisdiction (session_id, building_id, asteroid_id )

Returns a list of the platforms for an asteroid in the jurisdiction of the space station.

```json
{
  "status": {
    /* ... */
  },
  "platforms": [
    {
      "id": "id-goes-here",
      "empire": {
        "id": "id-goes-here",
        "name": "Klingons"
      }
    }
    /* ... */
  ]
}
```

### session_id

A session id.

### building_id

The unique id of the parliament.

### asteroid_id

The unique id of an asteroid in jurisdiction. See c&lt;get_bodies_for_star_in_jurisdiction>.

## cast_vote ( session_id, building_id, proposition_id, vote )

Casts a vote for or against a proposition. Cannot be voted on using a sitter password.

```json
    {
       "status" : { /* ... */ },
       "proposition" : {
           "id" : "id-goes-here",
           "name" : "Rename Station",
           "description" : "Rename the station from 'Bri Prui 7' to 'Deep Space 1'.",
           "votes_needed" : 7,
           "votes_yes" : 2,
           "votes_no" : 0,
           "status" : "Pending",
           "date_ends" : "01 31 2010 13:09:05 +0600",
           "proposed_by" : {
                "id" : "id-goes-here",
                "name" : "Klingons",
           },
           "my_vote" : 0 # not present if they haven't voted
       }
    }
```

### session_id

A session id.

### building_id

The unique id of the parliament.

### proposition_id

The id of the propostion your casting this vote for or against. See `view_propositions` for a list.

### vote

A boolean indicating which way you wish to vote. 1 for yes. 0 for no. Default is 0.

# Proposition Methods

The following methods propose laws or actions to be taken by the station on behalf of Parliament. There are many propositions that are implied, such as installing a new module or renaming the station. These propositions, must be explicitly declared through parliament by calling these methods.

## propose_writ ( session_id, building_id, title, description )

Proproses an unenforceable law. Only works with Parliament 4 and higher.

**NOTE:** See the `writ_templates` section of `resources.json`. These should be included as selectable options as a way to start the writeup of a title and description for a writ.

```json
{
  "status": {
    /* ... */
  },
  "proposition": {
    "id": "id-goes-here",
    "name": "Censure of Jamie Vrbsky",
    "description": "Jamie Vrbsky is bad at playing Lacuna!",
    "votes_needed": 7,
    "votes_yes": 0,
    "votes_no": 0,
    "status": "Pending",
    "date_ends": "01 31 2010 13:09:05 +0600",
    "proposed_by": {
      "id": "id-goes-here",
      "name": "Klingons"
    }
  }
}
```

### session_id

A session id.

### building_id

The unique id of the parliament.

### title

The name of the law.

### description

A detailed description of what the law intends to promote or prohibit. Same rules as an [Inbox](/api/Inbox) message body apply here.

## propose_repeal_law ( session_id, building_id, law_id )

Repeal an existing law. Usable at parliament level 5.

```json
{
  "status": {
    /* ... */
  },
  "proposition": {
    "id": "id-goes-here",
    "name": "Repeal Writ of Censure",
    "description": "Repeal this law: Jamie Vrbsky is bad at playing Lacuna!",
    "votes_needed": 7,
    "votes_yes": 0,
    "votes_no": 0,
    "status": "Pending",
    "date_ends": "01 31 2010 13:09:05 +0600",
    "proposed_by": {
      "id": "id-goes-here",
      "name": "Klingons"
    }
  }
}
```

### session_id

A session id.

### building_id

The unique id of the parliament.

### law_id

The id of a law to repeal.

## propose_transfer_station_ownership ( session_id, building_id, to_empire_id )

Transfer the ownership of the station to another member of the alliance. Only works with Parliament 6 and higher.

```json
{
  "status": {
    /* ... */
  },
  "proposition": {
    "id": "id-goes-here",
    "name": "Transfer Station",
    "description": "Transfer ownership of Deep Space 9 from The Federation to the Klingon Empire.",
    "votes_needed": 7,
    "votes_yes": 0,
    "votes_no": 0,
    "status": "Pending",
    "date_ends": "01 31 2010 13:09:05 +0600",
    "proposed_by": {
      "id": "id-goes-here",
      "name": "Klingons"
    }
  }
}
```

### session_id

A session id.

### building_id

The unique id of the parliament.

### to_empire_id

The id of an empire within the alliance that wants control over the station.

## propose_rename_star ( session_id, building_id, star_id, name )

Rename a star. Usable at parliament level 8.

```json
{
  "status": {
    /* ... */
  },
  "proposition": {
    "id": "id-goes-here",
    "name": "Rename Sol",
    "description": "Rename Sol to Sun.",
    "votes_needed": 7,
    "votes_yes": 0,
    "votes_no": 0,
    "status": "Pending",
    "date_ends": "01 31 2010 13:09:05 +0600",
    "proposed_by": {
      "id": "id-goes-here",
      "name": "Klingons"
    }
  }
}
```

### session_id

A session id.

### building_id

The unique id of the parliament.

### star_id

The id of a star to rename.

### name

The new name of the star.

## propose_broadcast_on_network19 ( session_id, building_id, message )

Broadcast any message you like on Network 19. Usable at parliament level 9.

```json
{
  "status": {
    /* ... */
  },
  "proposition": {
    "id": "id-goes-here",
    "name": "Network 19 Broadcast",
    "description": "Broadcast the following message on Network 19: Plant your corn early next season.",
    "votes_needed": 7,
    "votes_yes": 0,
    "votes_no": 0,
    "status": "Pending",
    "date_ends": "01 31 2010 13:09:05 +0600",
    "proposed_by": {
      "id": "id-goes-here",
      "name": "Klingons"
    }
  }
}
```

### session_id

A session id.

### building_id

The unique id of the parliament.

### message

A 140 character string that cannot contain special characters or profanity.

## propose_induct_member ( session_id, building_id, empire_id, [ message ] )

Induct a new member into the alliance. Once passed, an alliance invitation will be sent. Only works with Parliament 10 and higher.

```json
{
  "status": {
    /* ... */
  },
  "proposition": {
    "id": "id-goes-here",
    "name": "Induct Member",
    "description": "Induct The Romulans as a new member of The Federation.",
    "votes_needed": 7,
    "votes_yes": 0,
    "votes_no": 0,
    "status": "Pending",
    "date_ends": "01 31 2010 13:09:05 +0600",
    "proposed_by": {
      "id": "id-goes-here",
      "name": "Klingons"
    }
  }
}
```

### session_id

A session id.

### building_id

The unique id of the parliament.

### empire_id

The unique id of an empire proposed for membership in the alliance.

### message

Optional. A personalized welcome message that will be included in the invitation.

## propose_expel_member ( session_id, building_id, empire_id, [ message ] )

Expel a member from the alliance. Once passed, the member will be removed from the alliance. Only works with Parliament 10 and higher.

```json
{
  "status": {
    /* ... */
  },
  "proposition": {
    "id": "id-goes-here",
    "name": "Expel Member",
    "description": "Expel The Romulans from The Federation.",
    "votes_needed": 7,
    "votes_yes": 0,
    "votes_no": 0,
    "status": "Pending",
    "date_ends": "01 31 2010 13:09:05 +0600",
    "proposed_by": {
      "id": "id-goes-here",
      "name": "Klingons"
    }
  }
}
```

### session_id

A session id.

### building_id

The unique id of the parliament.

### empire_id

The unique id of an empire proposed for removal from the alliance.

### message

An optional message about why you're removing them from the alliance. Cannot contain restricted characters or profanity.

## propose_elect_new_leader ( session_id, building_id, to_empire_id )

Elect a new leader of the alliance. Only works with Parliament 11 and higher.

```json
{
  "status": {
    /* ... */
  },
  "proposition": {
    "id": "id-goes-here",
    "name": "Elect New Leader",
    "description": "Elect The Klingon Empire as the new leader of The Federation.",
    "votes_needed": 7,
    "votes_yes": 0,
    "votes_no": 0,
    "status": "Pending",
    "date_ends": "01 31 2010 13:09:05 +0600",
    "proposed_by": {
      "id": "id-goes-here",
      "name": "Romulus"
    }
  }
}
```

### session_id

A session id.

### building_id

The unique id of the parliament.

### to_empire_id

The unique id of an empire proposed as the new leader of the alliance. The empire must already be a member of the alliance.

## propose_rename_asteroid ( session_id, building_id, asteroid_id, name )

Rename any asteroid in the station's jurisdiction. Usable at parliament level 12.

```json
{
  "status": {
    /* ... */
  },
  "proposition": {
    "id": "id-goes-here",
    "name": "Rename Bebox 3",
    "description": "Rename the asteroid Bebox 3 to Big Rock.",
    "votes_needed": 7,
    "votes_yes": 0,
    "votes_no": 0,
    "status": "Pending",
    "date_ends": "01 31 2010 13:09:05 +0600",
    "proposed_by": {
      "id": "id-goes-here",
      "name": "Klingons"
    }
  }
}
```

### session_id

A session id.

### building_id

The unique id of the parliament.

### asteroid_id

The unique id of an asteroid in the station's jurisdiction to rename.

### name

A 30 chararacter string without profanity or special characters.

## propose_rename_uninhabited ( session_id, building_id, planet_id, name )

Rename any uninhabited planet in the station's jurisdiction. Usable at parliament level 17.

```json
{
  "status": {
    /* ... */
  },
  "proposition": {
    "id": "id-goes-here",
    "name": "Rename Bebox 4",
    "description": "Rename the planet Bebox 4 to Blue Orb.",
    "votes_needed": 7,
    "votes_yes": 0,
    "votes_no": 0,
    "status": "Pending",
    "date_ends": "01 31 2010 13:09:05 +0600",
    "proposed_by": {
      "id": "id-goes-here",
      "name": "Klingons"
    }
  }
}
```

### session_id

A session id.

### building_id

The unique id of the parliament.

### planet_id

The unique id of an uninhabited planet in the station's jurisdiction to rename.

### name

A 30 chararacter string without profanity or special characters.

## propose_members_only_mining_rights ( session_id, building_id )

If passed, only members of the alliance would be able to set up new mining platforms on asteroids in this station's jurisdiction. Usable at parliament level 13.

```json
{
  "status": {
    /* ... */
  },
  "proposition": {
    "id": "id-goes-here",
    "name": "Members Only Mining Rights",
    "description": "Only members of The Federation of Planets should be allowed to mine asteroids in the jurisdiction of this station.",
    "votes_needed": 7,
    "votes_yes": 0,
    "votes_no": 0,
    "status": "Pending",
    "date_ends": "01 31 2010 13:09:05 +0600",
    "proposed_by": {
      "id": "id-goes-here",
      "name": "Klingons"
    }
  }
}
```

### session_id

A session id.

### building_id

The unique id of the parliament.

## propose_evict_mining_platform ( session_id, building_id, platform_id )

Destroys a mining platform on an asteroid. Usable at parliament level 14.

```json
{
  "status": {
    /* ... */
  },
  "proposition": {
    "id": "id-goes-here",
    "name": "Evict Bjoran Mining Platform",
    "description": "Evict a mining platform on Big Rock that is controlled by Bjoran.",
    "votes_needed": 7,
    "votes_yes": 0,
    "votes_no": 0,
    "status": "Pending",
    "date_ends": "01 31 2010 13:09:05 +0600",
    "proposed_by": {
      "id": "id-goes-here",
      "name": "Klingons"
    }
  }
}
```

### session_id

A session id.

### building_id

The unique id of the parliament.

### platform_id

The unique id of a mining platform. See `get_platforms_for_asteroid_in_jurisdiction`.

## propose_taxation ( session_id, building_id, taxes )

Introduces an unenforceable law that imposes a tax on all empires under the jurisdiction of the space station. Usable at parliament level 15.

```json
{
  "status": {
    /* ... */
  },
  "proposition": {
    "id": "id-goes-here",
    "name": "Tax of 5000 resources per day",
    "description": "Implement a tax of 5000 resources per day for all empires in the jurisdiction of this station",
    "votes_needed": 7,
    "votes_yes": 0,
    "votes_no": 0,
    "status": "Pending",
    "date_ends": "01 31 2010 13:09:05 +0600",
    "proposed_by": {
      "id": "id-goes-here",
      "name": "Klingons"
    }
  }
}
```

### session_id

A session id.

### building_id

The unique id of the parliament.

### taxes

The amount of taxes to impose per day.

## propose_foreign_aid ( session_id, building_id, planet_id, resources )

Sends a foreign aid package to a planet in the jurisdiction of the station. The foreign aid is sent via supply pod. Usable at parliament level 16.

The foreign aid package costs double whatever aid is being sent. The first half to cover the cost of the supply pod, the second half is the resources being sent. Just like with normal supply pods, no more than one per day.

```json
{
  "status": {
    /* ... */
  },
  "proposition": {
    "id": "id-goes-here",
    "name": "Foreign Aid for Kronos",
    "description": "Send a foreign aid package of 10000 resources to Kronos (total cost 20000 resources).",
    "votes_needed": 7,
    "votes_yes": 0,
    "votes_no": 0,
    "status": "Pending",
    "date_ends": "01 31 2010 13:09:05 +0600",
    "proposed_by": {
      "id": "id-goes-here",
      "name": "Klingons"
    }
  }
}
```

### session_id

A session id.

### building_id

The unique id of the parliament.

### planet_id

The unique id of the planet to receive the foreign aid package.

### resources

The amount of resources to send to the receiving planet.

## propose_members_only_colonization ( session_id, building_id )

If passed, only members of the alliance would be able to set up new colonies on planets in this station's jurisdiction. Usable at parliament level 18.

```json
{
  "status": {
    /* ... */
  },
  "proposition": {
    "id": "id-goes-here",
    "name": "Members Only Colonization",
    "description": "Only members of The Federation of Planets should be allowed to colonize planets in the jurisdiction of this station.",
    "votes_needed": 7,
    "votes_yes": 0,
    "votes_no": 0,
    "status": "Pending",
    "date_ends": "01 31 2010 13:09:05 +0600",
    "proposed_by": {
      "id": "id-goes-here",
      "name": "Klingons"
    }
  }
}
```

### session_id

A session id.

### building_id

The unique id of the parliament.

## propose_members_only_excavation ( session_id, building_id )

If passed, only members of the alliance would be able to set up new colonies on planets in this station's jurisdiction. Usable at parliament level 18.

```json
{
  "status": {
    /* ... */
  },
  "proposition": {
    "id": "id-goes-here",
    "name": "Members Only Excavation",
    "description": "Only members of The Federation of Planets should be allowed to excavate planets in the jurisdiction of this station.",
    "votes_needed": 7,
    "votes_yes": 0,
    "votes_no": 0,
    "status": "Pending",
    "date_ends": "01 31 2010 13:09:05 +0600",
    "proposed_by": {
      "id": "id-goes-here",
      "name": "Klingons"
    }
  }
}
```

### session_id

A session id.

### building_id

The unique id of the parliament.

## propose_members_only_stations ( session_id, building_id )

If passed, only members of the alliance would be able to set up new stations in this station's jurisdiction. Usable at parliament level 18.

```json
{
  "status": {
    /* ... */
  },
  "proposition": {
    "id": "id-goes-here",
    "name": "Members Only Stations",
    "description": "Only members of The Federation of Planets should be allowed to setup new stations in the jurisdiction of this station.",
    "votes_needed": 7,
    "votes_yes": 0,
    "votes_no": 0,
    "status": "Pending",
    "date_ends": "01 31 2010 13:09:05 +0600",
    "proposed_by": {
      "id": "id-goes-here",
      "name": "Klingons"
    }
  }
}
```

### session_id

A session id.

### building_id

The unique id of the parliament.

## propose_neutralize_bhg ( session_id, building_id )

If passed, Black Hole Generators will not be able to be used on or from systems in the jurisdiction of this station by members outside the alliance. Usable at parliament level 23.

```json
{
  "status": {
    /* ... */
  },
  "proposition": {
    "id": "id-goes-here",
    "name": "BHG Neutralized",
    "description": "Black Hole Generators will not function in the jurisdiction of this station.",
    "votes_needed": 7,
    "votes_yes": 0,
    "votes_no": 0,
    "status": "Pending",
    "date_ends": "01 31 2010 13:09:05 +0600",
    "proposed_by": {
      "id": "id-goes-here",
      "name": "Klingons"
    }
  }
}
```

### session_id

A session id.

### building_id

The unique id of the parliament.

## propose_fire_bfg ( session_id, building_id, body_id, reason )

Fires the BFG equipped on all space stations at a planet of Parliament's choosing as long as it is within the jurisdiction of the station. Can only be called by Parliament level 25.

```json
{
  "status": {
    /* ... */
  },
  "proposition": {
    "id": "id-goes-here",
    "name": "Fire BFG",
    "description": "Fire BFG at Alderaan from The Death Star. Reason cited: The princess isn't talking!",
    "votes_needed": 7,
    "votes_yes": 0,
    "votes_no": 0,
    "status": "Pending",
    "date_ends": "01 31 2010 13:09:05 +0600",
    "proposed_by": {
      "id": "id-goes-here",
      "name": "Admiral Motti"
    }
  }
}
```

### session_id

A session id.

### building_id

The unique id of the parliament.

### body_id

A planet to fire at. See `get_bodies_for_star_in_jurisdiction` for details.

### reason

An explict reason why the BFG should be fired upon the target. Same rules as an [Inbox](/api/Inbox) message body apply here.

## allow_bhg_by_alliance ( session_id, building_id, alliance_id )

If passed, Black Hole Generators of members of another alliance are allowed to use their BHGs in this stations jurisdiction. Will also ignore Members Only Colonies & Stations. Usable at parliament level 28.

```json
{
  "status": {
    /* ... */
  },
  "proposition": {
    "id": "id-goes-here",
    "name": "BHG Passport",
    "description": "Black Hole Generators of alliance Star Fleet are allowed to be used in the jurisdiction of this station.",
    "votes_needed": 7,
    "votes_yes": 0,
    "votes_no": 0,
    "status": "Pending",
    "date_ends": "01 31 2010 13:09:05 +0600",
    "proposed_by": {
      "id": "id-goes-here",
      "name": "Klingons"
    }
  }
}
```

### session_id

A session id.

### building_id

The unique id of the parliament.

### alliance_id

The unique id of the alliance to be allowed to use their BHGs.

```

```
