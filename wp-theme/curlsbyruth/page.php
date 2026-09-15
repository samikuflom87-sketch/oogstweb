<?php
/**
 * Losse pagina's: Over ons, Contact, voorwaarden, retourbeleid.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>

<div class="section"><div class="wrap wrap--narrow">
	<?php while ( have_posts() ) : the_post(); ?>
		<article <?php post_class(); ?>>
			<h1 class="serif page-title"><?php the_title(); ?></h1>
			<div class="rich"><?php the_content(); ?></div>
		</article>
	<?php endwhile; ?>
</div>
</div>

<?php
get_footer();
