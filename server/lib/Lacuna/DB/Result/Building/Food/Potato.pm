package Lacuna::DB::Result::Building::Food::Potato;

use Moose;
use utf8;
no warnings qw(uninitialized);
extends 'Lacuna::DB::Result::Building::Food';

before has_special_resources => sub {
    my $self = shift;
    my $planet = $self->body;
    my $amount_needed = sprintf('%.0f', $self->ore_to_build * $self->upgrade_cost * 0.01);
    if ($planet->get_stored('gypsum') + $planet->get_stored('sulfur') + $planet->get_stored('monazite') < $amount_needed) {
        confess [1012,"You do not have a sufficient supply (".$amount_needed.") of phosphorus from sources like Gypsum, Sulfur, and Monazite to grow plants."];
    }
};

use constant controller_class => 'Lacuna::RPC::Building::Potato';

use constant min_orbit => 3;

use constant max_orbit => 4;

use constant image => 'potato';

use constant name => 'Potato Patch';

use constant food_to_build => 10;

use constant energy_to_build => 90;

use constant ore_to_build => 56;

use constant water_to_build => 10;

use constant waste_to_build => 10;

use constant time_to_build => 60;

use constant food_consumption => 1;

use constant potato_production => 24;

use constant energy_consumption => 1;

use constant ore_consumption => 1;

use constant water_consumption => 2;

use constant waste_production => 2;

around produces_food_items => sub {
    my ($orig, $class) = @_;
    my $foods = $orig->($class);
    push @{$foods}, qw(potato);
    return $foods;
};


no Moose;
__PACKAGE__->meta->make_immutable(inline_constructor => 0);
