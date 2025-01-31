use 5.010;
use strict;
use lib '/home/lacuna/server/lib';
use Lacuna::DB;
use Lacuna;
use Lacuna::Util qw(randint format_date);
use Getopt::Long;
use List::MoreUtils qw(uniq);
$|=1;
our $quiet;
GetOptions(
    'quiet'         => \$quiet,
);



out('Started');
my $start = time;

out('Loading DB');
our $db = Lacuna->db;

out('Creating empire...');
for my $num (2..40) {
  my $name = sprintf("Test%02d",$num);
  my $empire = Lacuna->db->resultset('Empire')->new({
    name                => $name,
    stage               => 'founded',
    date_created        => DateTime->now,
    status_message      => 'Quick Test',
    description         => 'Soon will be gone',
    password            => Lacuna::DB::Result::Empire->encrypt_password(rand(99999999)),
    sitter_password     => 'testsit',
    species_name            => 'CTD',
    species_description     => 'temp',
    min_orbit               => 1,
    max_orbit               => 7,
    manufacturing_affinity  => 4, # cost of building new stuff
    deception_affinity      => 7, # spying ability
    research_affinity       => 1, # cost of upgrading
    management_affinity     => 7, # speed to build
    farming_affinity        => 1, # food
    mining_affinity         => 1, # minerals
    science_affinity        => 7, # energy, propultion, and other tech
    environmental_affinity  => 1, # waste and water
    political_affinity      => 1, # happiness
    trade_affinity          => 1, # speed of cargoships, and amount of cargo hauled
    growth_affinity         => 7, # price and speed of colony ships, and planetary command center start level
  });

  out('Find home planet...');
  $empire->insert;
  my $home = $empire->find_home_planet;
  $empire->found($home);
  out('Placing Embassy for '.$name.' on '.$home->name);
  my $bld = Lacuna->db->resultset('Building')->new({
      body_id  => $home->id,
      x        => 1,
      y        => 0,
      class    => 'Lacuna::DB::Result::Building::Embassy',
      level    => 0,
   });
   $home->build_building($bld);
   $bld->finish_upgrade;
}

my $finish = time;
out('Finished');
out((($finish - $start)/60)." minutes have elapsed");




###############
## SUBROUTINES
###############




sub out {
    my $message = shift;
    unless ($quiet) {
        say format_date(DateTime->now), " ", $message;
    }
}
