<?php
/**
 * De inhoud van de winkelmandlade.
 *
 * Dit stuk wordt door WooCommerce zelf ververst na elke toevoeging, dus het
 * moet op zichzelf kunnen staan zonder de rest van de pagina.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! cbr_shop_actief() || ! WC()->cart ) {
	return;
}

$cart     = WC()->cart;
$regels   = $cart->get_cart();
$subtotaal = (float) $cart->get_subtotal();
$drempel  = (float) get_theme_mod( 'cbr_gratis_vanaf', 50 );
?>
<div class="drawer__inhoud" data-cart-drawer-inhoud>

	<?php if ( empty( $regels ) ) : ?>

		<div class="drawer__leeg">
			<p class="serif">Je winkelmand is nog leeg.</p>
			<p>Zoek iets uit dat bij jouw krullen past.</p>
			<a class="btn" href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>">Naar de shop</a>
		</div>

	<?php else : ?>

		<div class="drawer__body">
			<?php if ( $drempel > 0 ) : ?>
				<?php
				$restant = max( 0, $drempel - $subtotaal );
				$deel    = $drempel > 0 ? min( 100, ( $subtotaal / $drempel ) * 100 ) : 100;
				?>
				<div class="drawer__verzending">
					<?php if ( $restant > 0 ) : ?>
						<p>Nog <strong><?php echo wp_kses_post( wc_price( $restant ) ); ?></strong> tot gratis verzending</p>
					<?php else : ?>
						<p>Je verzending is gratis.</p>
					<?php endif; ?>
					<div class="ship-bar"><span class="ship-bar__fill" style="width:<?php echo esc_attr( round( $deel ) ); ?>%"></span></div>
				</div>
			<?php endif; ?>

			<?php foreach ( $regels as $sleutel => $regel ) : ?>
				<?php
				$p = $regel['data'];
				if ( ! $p || ! $p->exists() || $regel['quantity'] <= 0 ) {
					continue;
				}
				$merk = $p->get_attribute( 'merk' );
				?>
				<div class="drawer-row">
					<div class="drawer-row__media" style="background:<?php echo esc_attr( cbr_merk_zacht( $merk ) ); ?>">
						<?php echo wp_kses_post( $p->get_image( 'woocommerce_thumbnail' ) ); ?>
					</div>

					<div>
						<span class="drawer-row__name"><?php echo esc_html( $p->get_name() ); ?></span>
						<div class="drawer-row__meta">
							<?php echo esc_html( $regel['quantity'] ); ?> &times; <?php echo wp_kses_post( wc_price( $p->get_price() ) ); ?>
						</div>
						<a class="mini-remove" href="<?php echo esc_url( wc_get_cart_remove_url( $sleutel ) ); ?>"
						   aria-label="<?php echo esc_attr( sprintf( '%s uit je winkelmand halen', $p->get_name() ) ); ?>">Verwijderen</a>
					</div>

					<div class="drawer-row__prijs">
						<?php echo wp_kses_post( wc_price( (float) $p->get_price() * (int) $regel['quantity'] ) ); ?>
					</div>
				</div>
			<?php endforeach; ?>
		</div>

		<div class="drawer__foot">
			<div class="sum-row sum-row--total">
				<span>Subtotaal</span>
				<span><?php echo wp_kses_post( wc_price( $subtotaal ) ); ?></span>
			</div>
			<p class="drawer__note">Verzendkosten en kortingen bereken je bij het afrekenen.</p>
			<a class="btn btn--full" href="<?php echo esc_url( wc_get_checkout_url() ); ?>">Afrekenen</a>
			<a class="btn btn--outline btn--full" href="<?php echo esc_url( wc_get_cart_url() ); ?>">Winkelmand bekijken</a>
		</div>

	<?php endif; ?>
</div>
