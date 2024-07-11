LoultControls = function ( object, domElement ) {

    this.object = object;
    this.target = new THREE.Vector3();

    this.domElement = ( domElement !== undefined ) ? domElement : document;

    this.enabled = true;

    this.velocity = 0;
    this.damping = 0.4;
    this.height = 0.5;

    this.movementSpeed = 1.0;
    this.lookSpeed = 0.005;

    this.lookVertical = true;
    this.autoForward = false;

    this.activeLook = true;

    this.heightSpeed = false;
    this.heightCoef = 1.0;
    this.heightMin = 0.0;
    this.heightMax = 1.0;

    this.constrainVertical = false;
    this.verticalMin = 0;
    this.verticalMax = Math.PI;

    this.autoSpeedFactor = 0.0;

    this.mouseX = 0;
    this.mouseY = 0;

    this.lat = 0;
    this.lon = 0;
    this.phi = 0;
    this.theta = 0;

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;

    this.mouseDragOn = false;
    this.upReleased = false;

    // Dash effect properties
    this.isDashing = false;
    this.dashDuration = 300; // Dash duration in milliseconds

    this.viewHalfX = 0;
    this.viewHalfY = 0;

    if ( this.domElement !== document ) {
      this.domElement.setAttribute( 'tabindex', - 1 );
    }

    this.handleResize = function () {

      if ( this.domElement === document ) {

        this.viewHalfX = window.innerWidth / 2;
        this.viewHalfY = window.innerHeight / 2;

      } else {

        this.viewHalfX = this.domElement.offsetWidth / 2;
        this.viewHalfY = this.domElement.offsetHeight / 2;

      }

    };

    this.onMouseDown = function ( event ) {
      if (this.upReleased) {
        this.isDashing = true;
        setTimeout(() => {
          this.isDashing = false;
        }, this.dashDuration);
      }

      if ( this.activeLook ) {
        switch ( event.button ) {
          case 0: this.moveForward = true; break;
          case 2: this.moveBackward = true; break;
        }
      }

      this.mouseDragOn = true;

      event.stopPropagation();
    };

    this.onMouseUp = function ( event ) {
      if ( this.activeLook ) {
        switch ( event.button ) {
          case 0: this.moveForward = false; break;
          case 2: this.moveBackward = false; break;
        }
      }

      this.mouseDragOn = false;
      this.upReleased = true;

      setTimeout(() => {
        this.upReleased = false;
      }, 100);
    };

    this.onMouseMove = function ( event ) {
      if ( this.domElement === document ) {
        this.mouseX = event.pageX - this.viewHalfX;
        this.mouseY = event.pageY - this.viewHalfY;
      } else {
        this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
        this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;
      }
    };

    this.update = function( delta ) {
      if ( this.enabled === false ) return;

      var dashFactor = this.isDashing ? 8 : 1;
      var actualMoveSpeed = delta * this.movementSpeed * dashFactor;

      if ( this.moveForward) this.object.translateZ( - actualMoveSpeed);
      if ( this.moveBackward) this.object.translateZ( actualMoveSpeed);

      //add gravity
      if (this.object.position.y <= this.height) {
        this.velocity = 0;
        this.object.position.y = this.height;
      } else {
        this.velocity -= 9.8 * 0.002 * delta;
        this.object.position.y += this.velocity * delta;
      }
      

      var actualLookSpeed = delta * this.lookSpeed;
      if ( ! this.activeLook ) {
        actualLookSpeed = 0;
      }
      var verticalLookRatio = 1;
      if ( this.constrainVertical ) {
        verticalLookRatio = Math.PI / ( this.verticalMax - this.verticalMin );
      }

      this.lon += this.mouseX * actualLookSpeed;
      if ( this.lookVertical ) this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;

      this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
      this.phi = THREE.Math.degToRad( 90 - this.lat );

      this.theta = THREE.Math.degToRad( this.lon );

      if ( this.constrainVertical ) {
        this.phi = THREE.Math.mapLinear( this.phi, 0, Math.PI, this.verticalMin, this.verticalMax );
      }

      var targetPosition = this.target,
        position = this.object.position;

      targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
      targetPosition.y = position.y + 100 * Math.cos( this.phi );
      targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );

      this.object.lookAt( targetPosition );
    };

    function contextmenu( event ) {
      event.preventDefault();
    }

    this.dispose = function() {
      this.domElement.removeEventListener( 'contextmenu', contextmenu, false );
      this.domElement.removeEventListener( 'mousedown', _onMouseDown, false );
      this.domElement.removeEventListener( 'mousemove', _onMouseMove, false );
      this.domElement.removeEventListener( 'mouseup', _onMouseUp, false );
    };

    var _onMouseMove = bind( this, this.onMouseMove );
    var _onMouseDown = bind( this, this.onMouseDown );
    var _onMouseUp = bind( this, this.onMouseUp );

    this.domElement.addEventListener( 'contextmenu', contextmenu, false );
    this.domElement.addEventListener( 'mousemove', _onMouseMove, false );
    this.domElement.addEventListener( 'mousedown', _onMouseDown, false );
    this.domElement.addEventListener( 'mouseup', _onMouseUp, false );

    function bind( scope, fn ) {
      return function () {
        fn.apply( scope, arguments );
      };
    }
    this.handleResize();
};
