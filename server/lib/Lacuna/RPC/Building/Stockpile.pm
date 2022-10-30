package Lacuna::RPC::Building::Stockpile;

use Moose;
use utf8;
no warnings qw(uninitialized);
extends 'Lacuna::RPC::Building';

sub app_url {
    return '/stockpile';
}

sub model_class {
    return 'Lacuna::DB::Result::Building::Stockpile';
}



no Moose;
__PACKAGE__->meta->make_immutable;
